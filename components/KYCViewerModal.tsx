import React from 'react';
import Modal from './Modal';
import { User } from '../types';

interface KYCViewerModalProps {
  user: User;
  onClose: () => void;
}

const KYCViewerModal: React.FC<KYCViewerModalProps> = ({ user, onClose }) => {
  if (!user.kycDocument) {
    return null;
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`KYC Documents for ${user.fname} ${user.lname}`}
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-foreground mb-2">
            Document Type: <span className="font-normal text-muted-foreground">{user.kycDocument.type}</span>
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-foreground mb-2 text-center">
              {user.kycDocument.type === 'DriversLicense' ? 'Front Side' : 'Document Image'}
            </h5>
            <img 
              src={user.kycDocument.front} 
              alt="KYC Document Front" 
              className="w-full h-auto rounded-lg border border-border" 
            />
          </div>
          {user.kycDocument.back && (
            <div>
              <h5 className="font-semibold text-foreground mb-2 text-center">Back Side</h5>
              <img 
                src={user.kycDocument.back} 
                alt="KYC Document Back" 
                className="w-full h-auto rounded-lg border border-border" 
              />
            </div>
          )}
        </div>
        <div className="mt-6 text-right">
          <button 
            onClick={onClose} 
            className="bg-secondary text-secondary-foreground font-bold py-2 px-6 rounded-lg hover:bg-border transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default KYCViewerModal;
