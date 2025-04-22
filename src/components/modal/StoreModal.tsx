"use client";

import React from "react";
import Modal from "./Modal";
import StoreForm from "../StoreForm";
import useStoreModal from "@/hooks/use-store-modal";

const StoreModal = () => {
  const storeModal = useStoreModal();

  return (
    <Modal
      title="Create your Store"
      description="Add a new store to create and manage products, You can create up to 5 stores."
      isOpen={storeModal.isOpen}
      onClose={() => storeModal.onClose()}
    >
      <StoreForm isModal />
    </Modal>
  );
};

export default StoreModal;
