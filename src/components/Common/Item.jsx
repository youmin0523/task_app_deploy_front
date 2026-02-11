import React, { useState } from 'react';
import { MdEditDocument } from 'react-icons/md';
import { FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  fetchDeleteItem,
  fetchGetItem,
  fetchUpdateCompleted,
} from '../../redux/slices/apiSlice';
import { toast } from 'react-toastify';
import { openModal } from '../../redux/slices/modalSlice';

const Item = ({ task }) => {
  const { _id, title, description, date, iscompleted, isimportant, userid } =
    task;

  // console.log(task);
  const dispatch = useDispatch();
  const [isCompleted, setIsCompleted] = useState(iscompleted);

  const cutOverText = (text, length, lastDots) => {
    if (length === '' || length === null || length === undefined) {
      // 텍스트 길이(length) : 20으로 지정
      length = 20;
    }

    if (lastDots === '' || lastDots === null || lastDots === undefined) {
      // 텍스트 뒷부분에 붙일 문자열(lastDots) : '...'으로 지정
      lastDots = '...';
    }

    if (text.length > length) {
      // 텍스트 길이가 지정한 길이보다 길면 텍스트를 지정한 길이만큼 자르고 뒷부분에 문자열을 붙인다.
      text = text.substr(0, length) + lastDots;
    }

    return text;
  };

  const changeCompleted = async () => {
    // setIsCompleted(!isCompleted)을 호출하면 상태 업데이트가 비동기적으로 이루어지기 때문에, isCompleted의 값이 즉시 변경되지 않는다.
    // 따라서 updateCompletedData 객체를 생성할 때 isCompleted의 이전 값이 사용된다. 이로 인해 true/false가 한 단계씩 밀리게 된다.

    // 상태를 미리 업데이트 하여 반영된 값을 사용

    const newIsCompleted = !isCompleted;
    setIsCompleted(newIsCompleted);
    const updateCompletedKeys = {
      itemId: _id,
      isCompleted: newIsCompleted,
    };

    const options = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateCompletedKeys),
    };

    try {
      await dispatch(fetchUpdateCompleted(options)).unwrap();

      newIsCompleted
        ? toast.success('할 일을 완료했습니다.')
        : toast.success('할 일이 진행 중입니다.');

      await dispatch(fetchGetItem(userid)).unwrap();
    } catch (error) {
      // console.log('상태 업데이트에 실패했습니다.', error);
      toast.error('상태 업데이트에 실패했습니다.');
    }
  };

  const handleDeleteItem = async () => {
    const confirm = window.confirm('정말 삭제하시겠습니까?');
    // console.log(confirm);

    if (!confirm) return;

    if (!_id) {
      toast.error('잘못된 사용자 접근입니다.');
      return;
    }

    try {
      await dispatch(fetchDeleteItem(_id)).unwrap();
      toast.success('삭제가 완료되었습니다.');
      await dispatch(fetchGetItem(userid)).unwrap();
    } catch (error) {
      toast.error('삭제에 실패했습니다. 콘솔을 확인해주세요.');
      console.log('Delete Failed: ', error);
    }
  };

  const handleDetailOpenModal = () => {
    dispatch(openModal({ modalType: 'details', task }));
  };

  const handleEditOpenModal = () => {
    dispatch(openModal({ modalType: 'update', task }));
  };

  return (
    // //! [Original Code]
    // <div className="item w-1/3 h-[25vh] p-[0.25rem]">
    // 항상 한 줄에 3개씩(33%) 고정되어 모바일에서 찌그러짐

    // //* [Modified Code]
    // w-full md:w-1/2 lg:w-1/3: 반응형 그리드 시스템 적용
    // Mobile(1열) -> Tablet(2열) -> Desktop(3열)로 자연스럽게 확장
    <div className="item w-full md:w-1/2 lg:w-1/3 h-auto min-h-[25vh] p-[0.25rem]">
      <div className="w-full h-full border border-gray-500 rounded-md flex py-4 px-5 flex-col justify-between bg-gray-950 hover:shadow-lg transition-shadow duration-300">
        <div className="upper w-full">
          {/* //* [Modified Code] */}
          {/* // Header Layout: Title(Left) + Meta(Right) 구조로 변경하여 Date 가시성 확보 */}
          {/* // 기존 Footer에 있던 Date를 상단으로 올려 정보의 위계(Hierarchy) 정리 */}
          <div className="flex justify-between items-start mb-3 border-b border-gray-700 pb-2">
            <h2 className="text-xl font-normal flex-1 truncate pr-2">
              <span className="font-semibold">{title}</span>
            </h2>
            <div className="flex flex-col items-end gap-1">
              {/* 날짜를 상단으로 이동하여 하단 공간 확보 */}
              <span className="text-xs text-gray-500 font-mono">{date}</span>
              <span
                className="text-sm py-1 px-3 border border-gray-500 rounded-sm hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                onClick={handleDetailOpenModal}
              >
                자세히
              </span>
            </div>
          </div>

          <p className="text-gray-300 h-[4.5rem] overflow-hidden">
            {cutOverText(description, 60, '...')}
          </p>
        </div>

        <div className="lower mt-4 w-full">
          {/* //* [Modified Code] */}
          {/* // Footer Layout: 업무 상태(Left)와 관리 액션(Right)을 명확히 분리 */}
          {/* // 사용 빈도가 높은 '완료 처리'는 좌측, 신중해야 할 '수정/삭제'는 우측 배치 */}
          <div className="item-footer flex justify-between items-end w-full">
            <div className="flex gap-2 flex-wrap pb-1">
              {iscompleted ? (
                <button
                  className="block py-1 px-3 bg-green-400 text-xs text-white rounded-md whitespace-nowrap"
                  onClick={changeCompleted}
                >
                  Completed
                </button>
              ) : (
                <button
                  className="block py-1 px-3 bg-cyan-500 text-xs text-white rounded-md whitespace-nowrap"
                  onClick={changeCompleted}
                >
                  inCompleted
                </button>
              )}

              {isimportant && (
                <button className="block py-1 px-3 bg-red-500 text-xs text-white rounded-md whitespace-nowrap">
                  Important
                </button>
              )}
            </div>

            <div className="flex gap-2 text-gray-400 shrink-0">
              <button
                onClick={handleEditOpenModal}
                className="hover:text-white transition-colors"
              >
                <MdEditDocument className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteItem}
                className="hover:text-white transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Item;
