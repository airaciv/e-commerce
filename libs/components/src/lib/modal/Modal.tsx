import { Modal as BaseModal, ModalProps } from '@mui/material';

export const Modal = ({ open, onClose, children, ...props }: ModalProps) => {
  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto bg-white border- border-black shadow-2xl p-4">
        {children}
      </div>
    </BaseModal>
  );
};

export default Modal;
