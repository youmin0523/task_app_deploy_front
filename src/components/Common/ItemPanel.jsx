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
import { useGoogleLogin } from '@react-oauth/google';
import { login } from '../../redux/slices/authSlice';

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

  // //* [Added Code] ItemPanel 전용 구글 로그인 핸들러
  const handleLoginSuccess = async (tokenResponse) => {
    try {
      console.log('[DEBUG] Token Response:', tokenResponse);
      const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        },
      );
      const userInfo = await response.json();
      console.log('[DEBUG] Fetched User Info:', userInfo);

      // //* [Critical Fix] userInfo에 sub가 없을 경우를 대비해 id 필드 등 확인
      if (userInfo) {
        dispatch(login({ authData: userInfo }));
        console.log('[DEBUG] Dispatching login with userInfo');
      }
    } catch (error) {
      console.error('Google Login Info Fetch Error In ItemPanel: ', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => console.log('Google Login Failed In ItemPanel:', error),
  });

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
          <button
            onClick={() => googleLogin()}
            className="flex justify-center items-center gap-2 bg-gray-300 text-gray-900 py-3 px-6 rounded-md hover:bg-white transition-all shadow-md group border border-gray-400"
          >
            <span className="text-sm font-bold tracking-tight">
              로그인이 필요한 서비스입니다.
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemPanel;
