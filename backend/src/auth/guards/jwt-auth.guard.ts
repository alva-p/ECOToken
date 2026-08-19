import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Exige un JWT válido (Authorization: Bearer ...). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
