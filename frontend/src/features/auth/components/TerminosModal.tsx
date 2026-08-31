import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

export const VERSION_TERMINOS = 'v1';

interface TerminosModalProps {
  open: boolean;
  onClose: () => void;
}

// Texto de términos y condiciones (E3-HU03). Mismo patrón <dialog> nativo
// que ConfirmModal — acá no hace falta un onConfirm, es de solo lectura.
export function TerminosModal({ open, onClose }: TerminosModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(90vw,560px)] rounded-xl border border-eco-border bg-eco-surface p-0 backdrop:bg-black/45"
    >
      <div className="max-h-[80vh] overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-eco-ink">
            Términos y condiciones
          </h2>
          <span className="rounded bg-eco-bg px-2 py-1 text-xs font-semibold text-eco-ink2">
            Versión {VERSION_TERMINOS}
          </span>
        </div>

        <div className="flex flex-col gap-4 text-sm leading-relaxed text-eco-ink2">
          <p>
            ECOToken es una plataforma piloto (proyecto final académico, UTN
            FRVM) que reconoce el reciclaje empresarial mediante el token ECO.{' '}
            <strong>
              El token ECO es interno, no transferible y no tiene valor
              económico ni constituye una criptomoneda
            </strong>
            — es un mecanismo de reconocimiento ambiental, no un medio de pago
            ni una inversión.
          </p>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              1. Registro y aprobación
            </h3>
            <p>
              Podés registrarte con un CUIT válido. El alta queda pendiente
              hasta que el equipo la revise y la apruebe o rechace, sin
              obligación de justificar la decisión.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              2. Veracidad de los datos
            </h3>
            <p>
              Declarás que los datos provistos (razón social, CUIT, domicilio,
              representante legal, email) son reales y te comprometés a
              mantenerlos actualizados. Datos falsos son motivo de rechazo o
              baja de la cuenta.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              3. Billetera custodial
            </h3>
            <p>
              La plataforma genera y administra una billetera (dirección en la
              red Ethereum) en tu nombre. No manejás la clave privada
              directamente: la plataforma firma las transacciones en tu nombre
              durante esta etapa piloto.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              4. Cálculo de tokens
            </h3>
            <p>
              El peso de material entregado se valida por la cooperativa y se
              convierte a tokens según una tabla de conversión que la plataforma
              puede actualizar.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              5. Cuenta y credenciales
            </h3>
            <p>
              Si tu alta es aprobada, recibís una contraseña temporal de un solo
              uso. Sos responsable de cambiarla y de la confidencialidad de tu
              cuenta.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              6. Datos personales
            </h3>
            <p>
              Los datos se usan para habilitar tu cuenta, generar
              comprobantes/certificados y reportes agregados a la Municipalidad.
              No se comparten con terceros fuera del proyecto. Tratamiento
              sujeto a la Ley 25.326 de Protección de Datos Personales.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              7. Naturaleza de piloto
            </h3>
            <p>
              El sistema corre sobre una red de prueba (Sepolia testnet). Puede
              tener interrupciones, cambios o discontinuarse al finalizar el
              proyecto académico, sin garantía de disponibilidad continua.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              8. Suspensión de la cuenta
            </h3>
            <p>
              La cuenta puede suspenderse por datos falsos, uso indebido o
              aportes fraudulentos.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">
              9. Modificaciones
            </h3>
            <p>
              Estos términos pueden actualizarse; cada aceptación queda
              registrada con fecha y versión.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-eco-ink">10. Contacto</h3>
            <p>somosecotoken@gmail.com</p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <Button color="org" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </dialog>
  );
}
