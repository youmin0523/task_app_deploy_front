import React from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { openModal } from '../../redux/slices/modalSlice';

const AddItem = () => {
  const dispatch = useDispatch();
  const handleOpenModal = () => {
    dispatch(openModal({ modalType: 'create', task: null }));
  };

  return (
    // //! [Original Code]
    // <div className="add-card item w-1/3 h-[25vh] p-[0.25rem]">
    // //* [Modified Code] Responsive Grid: 1 col (Mobile), 2 col (Tablet), 3 col (Desktop)
    <div className="add-card item w-full md:w-1/2 lg:w-1/3 h-[25vh] p-[0.25rem]">
      <div className="w-full h-full border border-gray-500 rounded-md flex py-3 items-center justify-center">
        <button
          className="flex items-center gap-2 group"
          onClick={handleOpenModal}
        >
          <IoAddCircleOutline className="w-8 h-8 text-gray-400 font-light group-hover:text-gray-200" />
          <span className="text-gray-400 group-hover:text-gray-200">
            Add Items
          </span>
        </button>
      </div>
    </div>
  );
};

export default AddItem;
