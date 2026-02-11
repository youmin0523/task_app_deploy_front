import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../redux/slices/modalSlice';
import {
  fetchGetItem,
  fetchPostItem,
  fetchPutTaskItem,
} from '../../redux/slices/apiSlice';
import { toast } from 'react-toastify';

const Modal = () => {
  const dispatch = useDispatch();
  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  const { modalType, task } = useSelector((state) => state.modal);
  console.log(modalType, task);

  const state = useSelector((state) => state.auth.authData);
  const user = state?.sub;

  const showModalContents = (modalType, str1, str2, str3) => {
    switch (modalType) {
      case 'update':
        return str1;
      case 'details':
        return str2;
      default:
        return str3;
    }
  };

  const modalTitle = showModalContents(
    modalType,
    'Edit todo',
    'Todo Details',
    'Add todo',
  );

  const modalBtn = showModalContents(modalType, 'Edit todo', '', 'Add todo');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    isCompleted: false,
    isImportant: false,
    userId: user,
  });

  useEffect(() => {
    if (modalType === 'details' || modalType === 'update') {
      setFormData({
        title: task.title,
        description: task.description,
        date: task.date,
        isCompleted: task.iscompleted,
        isImportant: task.isimportant,
        _id: task._id,
      });
    } else {
      setFormData({
        title: '',
        description: '- ',
        date: '',
        isCompleted: false,
        isImportant: false,
        userId: user,
      });
    }
  }, [modalType, task, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // console.log(name, value, type, checked);
    // console.log(e.target.checked);
    setFormData((prev) => ({
      ...prev,
      // input의 타입이 checked일 경우, checked의 값으로 업데이트, 아니면 value의 값으로 업데이트
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // //* [Modified Code] Description 입력 시 엔터(Enter)를 누르면 자동으로 글머리 기호(- ) 추가
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const newValue =
        value.substring(0, selectionStart) +
        '\n- ' +
        value.substring(selectionEnd);

      setFormData((prev) => ({
        ...prev,
        description: newValue,
      }));

      // 커서 위치 보정을 위해 setTimeout 사용 (React re-render 이후 실행)
      setTimeout(() => {
        const target = e.target;
        target.selectionStart = target.selectionEnd = selectionStart + 3; // '\n- ' 길이만큼 이동
      }, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 기능 차단

    if (!user) {
      toast.error('잘못된 사용자 입니다.');
      return;
    }

    if (!formData.title) {
      toast.error('제목을 입력해주세요.');
      return;
    }

    if (!formData.description) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    if (!formData.date) {
      toast.error('날짜를 입력해주세요.');
      return;
    }

    // console.log(formData);
    try {
      if (modalType === 'create') {
        await dispatch(fetchPostItem(formData)).unwrap(); // async-await을 사용할 때는 unwrap()을 사용하는 것이 좋다.
        toast.success('할 일 추가가 완료되었습니다.');
      } else if (modalType === 'update') {
        await dispatch(fetchPutTaskItem(formData)).unwrap();
        toast.success('할 일 수정이 완료되었습니다.');
      }
    } catch (error) {
      console.log('Error Post or Put Item Data:  ', error);
      toast.error('할 일 추가 또는 수정에 실패했습니다. 콘솔을 확인해주세요');
    }

    handleCloseModal();

    await dispatch(fetchGetItem(user)).unwrap();
  };

  return (
    <div className="modal fixed bg-black bg-opacity-50 w-full h-full left-0 top-0 z-50 flex justify-center items-center">
      <div className="form-wrapper bg-gray-700 rounded-md w-1/2 flex flex-col items-center relative p-4">
        <h2 className="text-2xl py-2 border-b border-gray-300 w-fit font-semibold">
          {modalTitle}
        </h2>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="input-control">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              placeholder="제목을 입력해주세요..."
              onChange={handleChange}
              {...(modalType === 'details' && { disabled: true })}
            />
          </div>
          <div className="input-control">
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              placeholder="내용을 입력해주세요..."
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              {...(modalType === 'details' && { disabled: true })}
            ></textarea>
          </div>
          <div className="input-control">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              name="date"
              onChange={handleChange}
              {...(modalType === 'details' && { disabled: true })}
            />
          </div>
          <div className="input-control toggler">
            <label htmlFor="isCompleted">Completed</label>
            <input
              type="checkbox"
              id="isCompleted"
              checked={formData.isCompleted}
              name="isCompleted"
              onChange={handleChange}
              {...(modalType === 'details' && { disabled: true })}
            />
          </div>
          <div className="input-control toggler">
            <label htmlFor="isImportant">Important</label>
            <input
              type="checkbox"
              id="isImportant"
              checked={formData.isImportant}
              name="isImportant"
              onChange={handleChange}
              {...(modalType === 'details' && { disabled: true })}
            />
          </div>
          <div className="submit-btn flex justify-end">
            <button
              type="submit"
              className={`flex justify-end bg-black py-3 px-6 rounded-md hover:bg-slate-900 ${modalType === 'details' ? 'hidden' : ''}`}
            >
              {modalBtn}
            </button>
          </div>
        </form>
        <IoMdClose
          className="absolute right-10 top-10 cursor-pointer"
          onClick={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default Modal;
