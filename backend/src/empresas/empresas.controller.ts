import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseEnumPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriaEmpresa, TipoRol } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { EmpresasService } from './empresas.service';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { RegistrarEmpresaDto } from './dto/registrar-empresa.dto';
import { AltaCooperativaDto } from './dto/alta-cooperativa.dto';
import { AgregarDocumentoVerificacionDto } from './dto/agregar-documento-verificacion.dto';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto';
import {
  ArchivoSubido,
  DIRECTORIO_VERIFICACION,
  DIRECTORIO_LOGOS,
  MIME_DOCUMENTO_VERIFICACION,
  MIME_LOGO,
  TAMANIO_MAXIMO_DOCUMENTO,
  TAMANIO_MAXIMO_LOGO,
} from './subida-verificacion';

/** Rutas HTTP de Empresa: solo delegan en el service. */
@Controller('empresas')
export class EmpresasController {
  constructor(private readonly service: EmpresasService) {}

  // ─── E3-HU01: registro público de empresa (queda en estado PENDIENTE) ───
  @Post('registro')
  registrar(@Body() dto: RegistrarEmpresaDto) {
    return this.service.registrar(dto);
  }

  // ─── E3-HU05: verificación (KYB) — carga de documentos ───
  // Público como el registro: la empresa recién registrada (aún PENDIENTE, sin
  // usuario) puede adjuntar su documentación. Sube el archivo (multipart, campo
  // `archivo`), valida tipo/tamaño y deja la empresa EN_REVISION.
  @Post(':id/documentos-verificacion')
  @UseInterceptors(
    FileInterceptor('archivo', {
      dest: DIRECTORIO_VERIFICACION,
      limits: { fileSize: TAMANIO_MAXIMO_DOCUMENTO },
    }),
  )
  agregarDocumentoVerificacion(
    @Param('id') id: string,
    @Body() dto: AgregarDocumentoVerificacionDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: TAMANIO_MAXIMO_DOCUMENTO }),
          // Se guarda en disco (dest), así que no hay `buffer` para validar los
          // magic numbers: se valida por mimetype declarado (skip magic numbers).
          new FileTypeValidator({
            fileType: MIME_DOCUMENTO_VERIFICACION,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    archivo: ArchivoSubido,
  ) {
    return this.service.agregarDocumentoVerificacion(id, dto, archivo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get(':id/documentos-verificacion')
  listarDocumentosVerificacion(@Param('id') id: string) {
    return this.service.listarDocumentosVerificacion(id);
  }

  // Revisión KYB del administrador: aprueba/rechaza la verificación de la empresa.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/verificacion/aprobar')
  aprobarVerificacion(@Param('id') id: string) {
    return this.service.aprobarVerificacion(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/verificacion/rechazar')
  rechazarVerificacion(@Param('id') id: string) {
    return this.service.rechazarVerificacion(id);
  }

  // Descarga de un documento de verificación (admin). Se consume con apiBlob
  // (fetch + JWT), así que no necesita el header CORP del logo. La ruta empieza
  // con el literal 'documentos-verificacion', no colisiona con :id.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get('documentos-verificacion/:docId/archivo')
  async archivoDocumento(
    @Param('docId') docId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { path, mime, nombre } =
      await this.service.obtenerArchivoDocumento(docId);
    res.set('Content-Disposition', `attachment; filename="${nombre}"`);
    return new StreamableFile(createReadStream(path), { type: mime });
  }

  // ─── "Mi Perfil": la empresa logueada ve sus propios datos ───
  // Debe declararse antes de @Get(':id') para que 'me' no matchee como un id.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA, TipoRol.COOPERATIVA)
  @Get('me')
  miPerfil(@CurrentUser() user: JwtPayload) {
    return this.service.miPerfil(user.empresaId);
  }

  // La empresa edita su propio perfil (antes de @Patch(':id'), que es de admin).
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA, TipoRol.COOPERATIVA)
  @Patch('me')
  actualizarMiPerfil(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ActualizarPerfilDto,
  ) {
    return this.service.actualizarMiPerfil(user.empresaId, dto);
  }

  // ─── Logo de la empresa (subida propia + servido público) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.EMPRESA, TipoRol.COOPERATIVA)
  @Post('me/logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      dest: DIRECTORIO_LOGOS,
      limits: { fileSize: TAMANIO_MAXIMO_LOGO },
    }),
  )
  subirLogo(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: TAMANIO_MAXIMO_LOGO }),
          new FileTypeValidator({
            fileType: MIME_LOGO,
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    logo: ArchivoSubido,
  ) {
    return this.service.actualizarLogo(user.empresaId, logo);
  }

  // Público: lo consume un <img>, que no puede mandar el token. El id es un uuid.
  // CORP cross-origin: Helmet pone `same-origin` por defecto y el navegador
  // bloquearía la imagen servida desde otro puerto (frontend 5173 ← backend 3000).
  @Get(':id/logo')
  async logo(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { path, mime } = await this.service.obtenerLogo(id);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    return new StreamableFile(createReadStream(path), { type: mime });
  }

  // ─── E4-HU01: alta administrativa de cooperativa ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Post('cooperativas')
  altaCooperativa(@Body() dto: AltaCooperativaDto) {
    return this.service.altaCooperativa(dto);
  }

  // ─── E3-HU04: panel de administración (aprobar / rechazar altas) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get('pendientes')
  findPendientes() {
    return this.service.findPendientes();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/aprobar')
  aprobar(@Param('id') id: string) {
    return this.service.aprobar(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.service.rechazar(id);
  }

  // ─── E4-HU03: buscador de empresas (cooperativa, con autocompletado) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.COOPERATIVA)
  @Get('buscar')
  buscar(@Query('q') q?: string) {
    return this.service.buscar(q ?? '');
  }

  // ─── Consulta, modificación y baja lógica (solo admin) ───
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get()
  findAll(
    @Query('categoria', new ParseEnumPipe(CategoriaEmpresa, { optional: true }))
    categoria?: CategoriaEmpresa,
  ) {
    return this.service.findAll(categoria);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpresaDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoRol.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
