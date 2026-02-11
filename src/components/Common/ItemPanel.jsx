import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageTitle from './PageTitle';
import AddItem from './AddItem';
import Modal from './Modal';
import Item from './Item';
import { fetchGetItem } from '../../redux/slices/apiSlice';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import LoadingSkeleton from './LoadingSkeleton';

const ItemPanel = ({ pageTitle, filteredCompleted, filteredImportant }) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  // Auth Data
  const state = useSelector((state) => state.auth.authData);
  // //! [Debug Code] Redux에서 가져온 인증 데이터 확인
  console.log('[DEBUG] Auth State:', state);

  // //! [Original Code]
  const userKey = state?.sub;
  // //! [Debug Code] 추출된 userKey 확인
  console.log('[DEBUG] User Key:', userKey);

  const isOpen = useSelector((state) => state.modal.isOpen);
  // console.log(isOpen);

  // Get Item Data
  const getTasksData = useSelector((state) => state.api.getItemData);
  // console.log(getTasksData);

  useEffect(() => {
    if (!userKey) return;

    // //! [Debug Code] useEffect 실행 여부 확인
    console.log('[DEBUG] useEffect Triggered. Fetching items for:', userKey);

    const fetchGetItemsData = async () => {
      try {
        setLoading(true);
        await dispatch(fetchGetItem(userKey)).unwrap();
      } catch (error) {
        console.log('Failed to fetch Items: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGetItemsData();
  }, [dispatch, userKey]);

  // 1. Home 메뉴를 선택할 때:
  // ( ... 기존 주석 내용 유지 ... )
  // 4. Important 메뉴를 선택할 때:

  // //* [Restored Code] 실수로 삭제된 필터링 로직 복구
  // //* [Bug Fix] getTasksData가 null일 경우 체이닝(.filter) 과정에서 undefined.filter() 호출로 인해 크래시가 발생하는 문제 수정
  // -> 값이 있을 때만 필터를 수행하고, 없으면 빈 배열([])을 반환하도록 보호 조치
  const filteredTasks = getTasksData
    ? getTasksData
        .filter((task) => {
          if (filteredCompleted === 'all') return true;
          return filteredCompleted ? task.iscompleted : !task.iscompleted;
        })
        .filter((task) => {
          if (filteredImportant === undefined) return true;
          return filteredImportant ? task.isimportant : !task.isimportant;
        })
    : [];

  return (
    // //! [Original Code] 테두리 제거 및 원상복구
    // <div className="panel bg-[#212121] w-full lg:w-4/5 h-full rounded-md border border-gray-500 py-5 px-4 overflow-y-auto">

    // //* [Modified Code] Layout Fix: 고정 너비(w-4/5) 제거하고 Flex-1 적용
    // Sidebar의 너비(w-72 등)와 상관없이 남은 공간을 자동으로 가득 채우도록 수정하여 화면 잘림 현상 해결
    <div className="panel bg-[#212121] flex-1 h-full rounded-md border border-gray-500 py-5 px-4 overflow-y-auto">
      {userKey ? (
        <div className="w-full h-full">
          {isOpen && <Modal />}
          <PageTitle title={pageTitle} />
          <div className="flex flex-wrap">
            {loading ? (
              <SkeletonTheme
                baseColor="#202020"
                highlightColor="#444"
                height="25vh"
              >
                <LoadingSkeleton />
                <LoadingSkeleton />
                <LoadingSkeleton />
              </SkeletonTheme>
            ) : (
              filteredTasks?.map((task, idx) => <Item key={idx} task={task} />)
            )}

            <AddItem />
          </div>
        </div>
      ) : (
        <div className="login-message w-full h-full flex items-center justify-center">
          <button className="flex justify-center items-center gap-2 bg-gray-300 text-gray-900 py-2 px-4 rounded-md">
            <span className="text-sm font-semibold">
              로그인이 필요한 서비스입니다.
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemPanel;
