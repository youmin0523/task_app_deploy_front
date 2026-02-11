import React, { useCallback, useState, useEffect } from 'react';
import {
  MdMenu,
  MdClose,
  MdLogin,
  MdLogout,
  MdPerson,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdCalendarToday,
  MdUpcoming,
} from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { navMenus } from '../../utils/naviList';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/slices/authSlice';
import {
  fetchUpdateCompleted,
  fetchGetItem,
  fetchPutTaskItem,
} from '../../redux/slices/apiSlice';
import { openModal } from '../../redux/slices/modalSlice';
import { toast } from 'react-toastify';

// //* 개인적으로 정리해볼 것
const Navbar = () => {
  const path = useLocation();
  const isActive = (location) => path.pathname === location;

  const googleClientId = import.meta.env.VITE_AUTH_CLIENT_ID;

  const dispatch = useDispatch();
  const state = useSelector((state) => state.auth.authData);
  // //! [Original Code] name만 추출
  // const { name } = state || {};

  // //* [Modified Code] 프로필 이미지(picture)도 함께 추출하여 사이드바 UI에 반영
  const { name, picture } = state || {};

  //  !: 부정 !!name: name 값이 있는지 엄격히 체크 -> name이 존재하면 true, null이면 false
  const [isAuth, setIsAuth] = useState(!!name);

  // //* [Added Code] Today's Todo Logic
  // 오늘 날짜의 미완료 항목 필터링하여 사이드바에 표시하기 위한 데이터 준비
  // isCompleted가 false인 항목만 추출하여 todaysTasks에 저장
  const tasks = useSelector((state) => state.api.getItemData);
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = tasks?.filter(
    (task) => task.date === today && !task.iscompleted,
  );

  // //* [Added Code] Tomorrow's Todo Logic
  // 내일 날짜 계산 및 내일의 미완료 항목 필터링
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];
  const tomorrowsTasks = tasks?.filter(
    (task) => task.date === tomorrow && !task.iscompleted,
  );

  // //* [Added Code] Collapsible State for Todo Sections
  // Today's Todo와 Tomorrow's Todo 섹션의 접힘/펼침 상태를 관리하는 State.
  // 기본값은 true(펼침)로 설정.
  const [isTodayOpen, setIsTodayOpen] = useState(true);
  const [isTomorrowOpen, setIsTomorrowOpen] = useState(true);

  // //* [Added Code] Interactive Handlers for Today's Todo
  // Todo 항목을 직접 완료 처리하는 핸들러. 체크박스 클릭 시 호출됨.
  // 부모 요소로의 이벤트 전파를 막고(stopPropagation), 즉시 완료 상태(isCompleted: true)로 업데이트 요청 전송.
  const handleToggleCompleted = async (e, task) => {
    e.stopPropagation(); // 부모 클릭 이벤트 전파 방지
    const updateData = {
      itemId: task._id,
      isCompleted: true, // 바로 완료 처리
    };

    try {
      await dispatch(
        fetchUpdateCompleted({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }),
      ).unwrap();
      toast.success('할 일이 완료되었습니다.');
      await dispatch(fetchGetItem(state.sub)).unwrap();
    } catch (error) {
      toast.error('상태 업데이트 실패');
    }
  };

  // //* [Added Code] Toggle Important Status
  // 중요 상태 토글 핸들러. Red Dot 또는 Outline Circle 클릭 시 호출됨.
  // [Fix] API Payload 최적화: 불필요한 필드를 제외하고 필요한 필드만 명시적으로 전송하여 에러 방지.
  const handleToggleImportant = async (e, task) => {
    e.stopPropagation();
    const updateData = {
      _id: task._id,
      title: task.title,
      description: task.description,
      date: task.date,
      isCompleted: task.iscompleted,
      isImportant: !task.isimportant,
    };

    try {
      await dispatch(fetchPutTaskItem(updateData)).unwrap();
      await dispatch(fetchGetItem(state.sub)).unwrap();
    } catch (error) {
      toast.error('중요 표시 변경 실패');
    }
  };

  // //* [Added Code] Open Detail Modal
  // 항목 클릭 시 상세 정보 모달을 'details' 타입으로 오픈.
  const handleOpenDetail = (task) => {
    dispatch(openModal({ modalType: 'details', task }));
  };

  // //* [Modified Code] 사이드바 토글 상태 관리 (모바일/태블릿용)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // //* [Modified Code] 우측 상단 로그인 팝오버 상태 관리
  const [isLoginPopoverOpen, setIsLoginPopoverOpen] = useState(false);

  // //* [Modified Code] 데스크탑 사이드바 토글 상태 관리
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  // //* [Modified Code] 화면 크기 변경 감지 (Resize Handler)
  // 모바일에서 메뉴를 열어둔 채 브라우저를 넓혔을 때,
  // 1. 데스크탑 모드로 전환되면서 사이드바가 자동으로 '항상 보임' 처리됨
  // 2. 이때 불필요하게 남아있을 수 있는 '열림 상태(isSidebarOpen=true)'를 false로 초기화하여 오버레이 제거 등 오동작 방지
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isLoginPopoverOpen) setIsLoginPopoverOpen(false); // 사이드바 열 때 팝오버 닫기
  };

  const toggleLoginPopover = () => {
    setIsLoginPopoverOpen(!isLoginPopoverOpen);
    if (isSidebarOpen) setIsSidebarOpen(false); // 팝오버 열 때 사이드바 닫기
  };

  const handleLoginSuccess = useCallback(
    (credentialResponse) => {
      console.log(credentialResponse);
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        dispatch(login({ authData: decoded }));
        setIsAuth(true);
      } catch (error) {
        console.error('Google Login Error: ', error);
      }
    },
    [dispatch],
  );

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setIsAuth(false);
    setIsLogoutConfirmOpen(false);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const handleLoginError = (error) => {
    console.log('Google Login Error: ', error);
  };

  // //* [Added Code] Mobile Header Todo Handlers
  // 모바일 헤더의 투두 아이콘 클릭 시 사이드바를 열고 해당 섹션을 펼침
  const handleHeaderTodoClick = (type) => {
    setIsSidebarOpen(true);
    if (type === 'today') {
      setIsTodayOpen(true);
    } else {
      setIsTomorrowOpen(true);
    }
  };

  return (
    <>
      {
        // //* Logout Confirmation Modal
      }
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100">
            {
              // //* Header
            }
            <div className="bg-gradient-to-r from-red-900/40 to-[#1e1e1e] px-6 py-4 border-b border-gray-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center shrink-0">
                <MdLogout className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                로그아웃 확인
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6 text-center">
              <p className="text-gray-300 mb-2">정말 로그아웃 하시겠습니까?</p>
              <p className="text-gray-500 text-sm">
                로그아웃 후에는 다시 로그인해야 합니다.
              </p>
            </div>

            {
              // //* Footer / Actions
            }
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={cancelLogout}
                className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium text-sm"
              >
                취소
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30 transition-all transform hover:scale-[1.02] font-bold text-sm"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {
        // //* [Modified Code] 모바일/태블릿용 햄버거 메뉴 버튼
        // 화면 좌측 상단에 고정되어 메뉴를 열 수 있는 트리거 역할
      }
      <header className="fixed top-0 left-0 w-full h-14 bg-[#212121] border-b border-gray-700 flex items-center justify-between px-4 z-40 lg:hidden">
        {/* Left: Sidebar Toggle */}
        <button onClick={toggleSidebar} className="text-white p-1">
          <MdMenu className="w-7 h-7" />
        </button>

        {/* Center: Brand Logo */}
        <div
          className={`absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4 transition-opacity duration-300 ${
            isSidebarOpen ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="logo shrink-0 scale-75"></div>
          <h2 className="font-bold text-xl tracking-wider text-white">
            <Link to="/">YOUMINSU</Link>
          </h2>
        </div>

        {/* Right: Todos + Login/Profile Action */}
        <div className="flex items-center gap-3 relative">
          {
            // //* [Added Code] Mobile Header Todo Indicators
            // 모바일/태블릿에서 상단 네비게이션에 Today/Tomorrow 투두 상태 표시
          }
          <div
            className={`flex items-center gap-3 mr-1 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            {/* Today */}
            <div
              className="relative cursor-pointer group"
              onClick={() => handleHeaderTodoClick('today')}
            >
              <MdCalendarToday className="w-6 h-6 text-gray-400 hover:text-red-400 transition-colors" />
              {todaysTasks?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-[#212121]">
                  {todaysTasks.length}
                </span>
              )}

              {/* Mobile Header Hover Popup (Today) */}
              <div
                className="absolute top-full right-0 mt-4 w-72 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform translate-y-2 group-hover:translate-y-0 origin-top-right cursor-default"
                onClick={(e) => e.stopPropagation()} // Prevent sidebar opening when interacting with popup
              >
                <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                  <h4 className="text-gray-200 font-bold text-sm tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                    Today's Tasks
                  </h4>
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full font-mono">
                    {todaysTasks?.length || 0}
                  </span>
                </div>
                {todaysTasks?.length > 0 ? (
                  <ul className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                    {todaysTasks.map((task) => (
                      <li
                        key={task._id}
                        className="group/item flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600"
                        onClick={() => handleOpenDetail(task)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-500 hover:border-teal-400 transition-colors shrink-0"
                            onClick={(e) => handleToggleCompleted(e, task)}
                          >
                            <div className="w-2.5 h-2.5 bg-teal-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="truncate text-gray-300 text-sm group-hover/item:text-white font-medium">
                            {task.title}
                          </span>
                        </div>
                        <div
                          onClick={(e) => handleToggleImportant(e, task)}
                          className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              task.isimportant
                                ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                : 'bg-transparent border border-gray-500 hover:border-red-500'
                            }`}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-xs py-4">
                    할 일이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* Tomorrow */}
            <div
              className="relative cursor-pointer group"
              onClick={() => handleHeaderTodoClick('tomorrow')}
            >
              <MdUpcoming className="w-7 h-7 text-gray-400 hover:text-blue-400 transition-colors" />
              {tomorrowsTasks?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center border border-[#212121]">
                  {tomorrowsTasks.length}
                </span>
              )}

              {/* Mobile Header Hover Popup (Tomorrow) */}
              <div
                className="absolute top-full right-0 mt-4 w-72 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform translate-y-2 group-hover:translate-y-0 origin-top-right cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                  <h4 className="text-gray-200 font-bold text-sm tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                    Tomorrow's Tasks
                  </h4>
                  <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-0.5 rounded-full font-mono">
                    {tomorrowsTasks?.length || 0}
                  </span>
                </div>
                {tomorrowsTasks?.length > 0 ? (
                  <ul className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                    {tomorrowsTasks.map((task) => (
                      <li
                        key={task._id}
                        className="group/item flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600"
                        onClick={() => handleOpenDetail(task)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-500 hover:border-blue-400 transition-colors shrink-0"
                            onClick={(e) => handleToggleCompleted(e, task)}
                          >
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="truncate text-gray-300 text-sm group-hover/item:text-white font-medium">
                            {task.title}
                          </span>
                        </div>
                        <div
                          onClick={(e) => handleToggleImportant(e, task)}
                          className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              task.isimportant
                                ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                : 'bg-transparent border border-gray-500 hover:border-red-500'
                            }`}
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-gray-500 text-xs py-4">
                    할 일이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Login/Profile Action */}
          <div className="relative">
            {isAuth ? (
              <button
                onClick={handleLogoutClick}
                className="text-gray-300 hover:text-white p-1 flex items-center gap-1"
              >
                <MdLogout className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={toggleLoginPopover}
                className="text-gray-400 hover:text-white p-1"
              >
                <MdPerson className="w-7 h-7" />
              </button>
            )}

            {/* Login Popover */}
            {isLoginPopoverOpen && !isAuth && (
              <div className="absolute top-10 right-0 bg-white p-4 rounded-md shadow-lg border border-gray-200 z-50 w-64 min-w-max">
                <div className="text-gray-800 font-semibold mb-3 text-center text-sm">
                  로그인이 필요합니다
                </div>
                <div className="flex justify-center">
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleLogin
                      onSuccess={(res) => {
                        handleLoginSuccess(res);
                        setIsLoginPopoverOpen(false);
                      }}
                      onError={handleLoginError}
                    />
                  </GoogleOAuthProvider>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Popover Overlay */}
      {(isLoginPopoverOpen || isSidebarOpen) && (
        <div
          onClick={() => {
            setIsLoginPopoverOpen(false);
            setIsSidebarOpen(false);
          }}
          className="fixed inset-0 bg-black bg-opacity-50 z-45 lg:hidden cursor-default"
        ></div>
      )}

      {/* Spacer for Mobile Header */}
      <div className="w-full h-14 lg:hidden"></div>

      {
        // //* [Modified Code] Sidebar (Mini Sidebar Architecture)
        // //* [Modified Code] Responsive Logic: Full Sidebar OR Hidden
        // 애매한 '아이콘만 남는 모드(Mini Sidebar)'를 제거함.
        // Large Screen(lg): 항상 Full Sidebar (w-72)
        // Small Screen: 기본적으로 Hidden -> 토글 시 Full Sidebar 등장
        // //* [Restored & Refined Code] Responsive Sidebar Architecture
        // Mobile: Off-Canvas (Hidden <-> w-64 Full)
        // Desktop: Collapsible (w-[70px] Mini <-> w-72 Full)
      }
      <nav
        className={`bg-[#212121] h-full rounded-r-sm border-r border-gray-500 flex flex-col justify-start items-center 
        fixed top-0 left-0 z-50 py-4 px-4 lg:relative transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        ${
          isDesktopOpen
            ? 'lg:w-72 lg:py-10 lg:px-6 overflow-y-auto custom-scrollbar'
            : 'lg:w-[70px] lg:py-4 lg:px-2 overflow-visible'
        }
        `}
      >
        {/* Desktop Collapse Toggle (Only if Expanded) */}
        {isDesktopOpen && (
          <div className="w-full hidden lg:flex justify-end mb-4 absolute top-4 right-4">
            <button
              onClick={() => setIsDesktopOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Collapse Sidebar"
            >
              <MdKeyboardDoubleArrowLeft className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* MObile Close Button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white z-50"
        >
          <MdKeyboardDoubleArrowLeft className="w-6 h-6" />
        </button>

        {
          // //* [Modified Code] Absolute Position for Logo
          // 상단 고정 위치 지정
          // //* 항상 Full Mode로 표시
          // //* Desktop: Collapsed 상태일 때 클릭하면 확장되도록 로직 복구
        }
        <div
          className={`logo-wrapper flex w-full items-center gap-4 transition-all duration-300 z-10 shrink-0 
            justify-center py-6 
            ${isDesktopOpen ? 'lg:py-6' : 'lg:w-full lg:px-0 lg:cursor-pointer lg:hover:bg-gray-800 lg:py-4 lg:absolute lg:top-10 lg:left-0'}`}
          onClick={() => !isDesktopOpen && setIsDesktopOpen(true)}
          title={!isDesktopOpen ? 'Click to Expand' : ''}
        >
          <div className="w-[50px] h-[30px] relative shrink-0">
            <div className="logo"></div>
          </div>
          <h2
            className={`font-semibold text-xl whitespace-nowrap transition-opacity duration-300 block opacity-100 
              ${isDesktopOpen ? '' : 'lg:opacity-0 lg:hidden'}`}
          >
            <Link to="/">YOUMINSU</Link>
          </h2>
        </div>

        {
          // //* [Modified Code] Flexbox Vertical Layout Structure
          // 기존의 Absolute Positioning을 제거하고, 전체를 Flex Column으로 감싸서
          // 화면 높이가 줄어들어도 요소들이 겹치지 않고 자연스럽게 스택되거나 스크롤되도록 변경함.
          // 로고와의 간격을 넓히기 위해 pt-[60px] -> pt-[100px]로 변경.
          // //* Collapsed 모드 대비 상단 여백 동적 조정
        }
        <div
          className={`flex flex-col w-full h-full pb-6 gap-4 pt-2 ${isDesktopOpen ? 'lg:pt-2' : 'lg:pt-[100px]'}`}
        >
          {/* 1. Menu List (Fixed Height / Shrink-0) */}
          <div className="w-full shrink-0">
            <ul className="menus w-full flex flex-col gap-1">
              {navMenus.map((menu, idx) => (
                <li
                  key={idx}
                  className={`rounded-sm mb-1 border border-gray-700 hover:bg-gray-950 transition-all duration-300 ${
                    isActive(menu.to)
                      ? 'bg-gray-950 border-gray-500'
                      : 'border-transparent'
                  }`}
                >
                  <Link
                    to={menu.to}
                    className={`group/link flex items-center py-3 transition-all duration-300 relative px-4 gap-x-4 justify-start 
                      ${isDesktopOpen ? '' : 'lg:px-0 lg:justify-center lg:w-full'}`}
                  >
                    <div className="text-xl flex items-center justify-center relative">
                      {menu.icon}
                      {/* Hover Tooltip for Collapsed Mode (Desktop Only) */}
                      {!isDesktopOpen && (
                        <div className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[#1e1e1e] border border-gray-700 text-gray-200 text-sm font-medium rounded-md shadow-xl opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible transition-all duration-200 whitespace-nowrap z-[9999] origin-left scale-95 group-hover/link:scale-100">
                          {menu.label}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1e1e1e] border-l border-b border-gray-700 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`whitespace-nowrap transition-all duration-300 block opacity-100 
                        ${isDesktopOpen ? '' : 'lg:opacity-0 lg:hidden lg:w-0'}`}
                    >
                      {menu.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Flexible Todo Area (Takes remaining space) */}
          <div
            className={`flex flex-col gap-2 w-full flex-1 min-h-[300px] overflow-hidden 
              ${isDesktopOpen ? '' : 'lg:flex-none lg:my-4 lg:min-h-0 lg:overflow-visible'}`}
          >
            {/* Today's Todo Section */}
            <div
              className={`flex flex-col w-full transition-all duration-300 flex-1 min-h-0 overflow-hidden px-6 
                ${isDesktopOpen ? 'lg:px-6' : 'lg:flex-none lg:shrink-0 lg:h-auto lg:items-center lg:overflow-visible lg:px-0'}`}
            >
              {/* Full List View (Visible on Mobile, Hidden on Desktop Collapse) */}
              <div
                className={`todays-todo w-full h-full flex flex-col ${!isDesktopOpen ? 'lg:hidden' : ''}`}
              >
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-800 p-1 rounded-md transition-colors shrink-0"
                  onClick={() => setIsTodayOpen(!isTodayOpen)}
                >
                  <div className="flex items-center gap-2">
                    {isTodayOpen ? (
                      <MdKeyboardArrowDown className="text-gray-400" />
                    ) : (
                      <MdKeyboardArrowUp className="text-gray-400" />
                    )}
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                      Today's Todo
                    </h3>
                  </div>
                  <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-md shadow-md shadow-red-900/50">
                    {todaysTasks?.length || 0}
                  </span>
                </div>
                {isTodayOpen && (
                  <ul className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {todaysTasks?.map((task) => (
                      <li
                        key={task._id}
                        className="group flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600 shrink-0"
                        onClick={() => handleOpenDetail(task)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-500 hover:border-teal-400 transition-colors shrink-0"
                            onClick={(e) => handleToggleCompleted(e, task)}
                          >
                            <div className="w-3 h-3 bg-teal-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="truncate text-gray-300 text-sm group-hover:text-white font-medium transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <div
                          onClick={(e) => handleToggleImportant(e, task)}
                          className="w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer group/indicator"
                        >
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${
                              task.isimportant
                                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] group-hover/indicator:scale-125'
                                : 'bg-transparent border-2 border-gray-600 group-hover/indicator:border-red-500'
                            }`}
                            title={
                              task.isimportant
                                ? 'Click to Unmark Important'
                                : 'Click to Mark as Important'
                            }
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Orb View (Hidden on Mobile, Visible on Desktop Collapse) */}
              {!isDesktopOpen && (
                <div className="hidden lg:flex relative group items-center justify-center py-2 z-50">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-800/80 border border-red-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all backdrop-blur-sm group-hover:scale-110 cursor-pointer relative"
                    onClick={() => setIsDesktopOpen(true)}
                  >
                    <MdCalendarToday className="text-red-400 w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 border-2 border-[#1e1e1e] text-[10px] font-bold text-white shadow-sm">
                      {todaysTasks?.length || 0}
                    </span>
                  </div>
                  {/* Orb Popup */}
                  <div className="absolute left-full top-0 ml-4 w-80 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform -translate-x-4 group-hover:translate-x-0 origin-left">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                      <h4 className="text-gray-200 font-bold text-sm tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                        Today's Tasks
                      </h4>
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-0.5 rounded-full font-mono">
                        {todaysTasks?.length || 0}
                      </span>
                    </div>
                    {todaysTasks?.length > 0 ? (
                      <ul className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                        {todaysTasks.map((task) => (
                          <li
                            key={task._id}
                            className="group/item flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600"
                            onClick={() => handleOpenDetail(task)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-500 hover:border-teal-400 transition-colors shrink-0"
                                onClick={(e) => handleToggleCompleted(e, task)}
                              >
                                <div className="w-2.5 h-2.5 bg-teal-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                              </div>
                              <span className="truncate text-gray-300 text-sm group-hover/item:text-white font-medium">
                                {task.title}
                              </span>
                            </div>
                            <div
                              onClick={(e) => handleToggleImportant(e, task)}
                              className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform"
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  task.isimportant
                                    ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                    : 'bg-transparent border border-gray-500 hover:border-red-500'
                                }`}
                              ></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-gray-500 text-xs py-4">
                        할 일이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Tomorrow's Todo Section */}
            <div
              className={`flex flex-col w-full transition-all duration-300 flex-1 min-h-0 overflow-hidden px-6 
                ${isDesktopOpen ? 'lg:px-6' : 'lg:flex-none lg:shrink-0 lg:h-auto lg:items-center lg:overflow-visible lg:px-0'}`}
            >
              {/* Full List View */}
              <div
                className={`tomorrows-todo w-full h-full flex flex-col ${!isDesktopOpen ? 'lg:hidden' : ''}`}
              >
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-800 p-1 rounded-md transition-colors shrink-0"
                  onClick={() => setIsTomorrowOpen(!isTomorrowOpen)}
                >
                  <div className="flex items-center gap-2">
                    {isTomorrowOpen ? (
                      <MdKeyboardArrowDown className="text-gray-400" />
                    ) : (
                      <MdKeyboardArrowUp className="text-gray-400" />
                    )}
                    <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                      Tomorrow's Todo
                    </h3>
                  </div>
                  <span className="text-xs bg-blue-500 text-white font-bold px-2 py-0.5 rounded-md shadow-md shadow-blue-900/50">
                    {tomorrowsTasks?.length || 0}
                  </span>
                </div>
                {isTomorrowOpen && (
                  <ul className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {tomorrowsTasks?.map((task) => (
                      <li
                        key={task._id}
                        className="group flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600 shrink-0"
                        onClick={() => handleOpenDetail(task)}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-500 hover:border-blue-400 transition-colors shrink-0"
                            onClick={(e) => handleToggleCompleted(e, task)}
                          >
                            <div className="w-3 h-3 bg-blue-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                          </div>
                          <span className="truncate text-gray-300 text-sm group-hover:text-white font-medium transition-colors">
                            {task.title}
                          </span>
                        </div>
                        <div
                          onClick={(e) => handleToggleImportant(e, task)}
                          className="w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer group/indicator"
                        >
                          <div
                            className={`w-3 h-3 rounded-full transition-all ${
                              task.isimportant
                                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] group-hover/indicator:scale-125'
                                : 'bg-transparent border-2 border-gray-600 group-hover/indicator:border-red-500'
                            }`}
                            title={
                              task.isimportant
                                ? 'Click to Unmark Important'
                                : 'Click to Mark as Important'
                            }
                          ></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Orb View */}
              {!isDesktopOpen && (
                <div className="hidden lg:flex relative group items-center justify-center py-2 z-40">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-800/80 border border-blue-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all backdrop-blur-sm group-hover:scale-110 cursor-pointer relative"
                    onClick={() => setIsDesktopOpen(true)}
                  >
                    <MdUpcoming className="text-blue-400 w-6 h-6" />
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 border-2 border-[#1e1e1e] text-[10px] font-bold text-white shadow-sm">
                      {tomorrowsTasks?.length || 0}
                    </span>
                  </div>
                  {/* Orb Popup */}
                  <div className="absolute left-full bottom-0 ml-4 w-80 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999] transform -translate-x-4 group-hover:translate-x-0 origin-bottom-left">
                    <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
                      <h4 className="text-gray-200 font-bold text-sm tracking-wider flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                        Tomorrow's Tasks
                      </h4>
                      <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-0.5 rounded-full font-mono">
                        {tomorrowsTasks?.length || 0}
                      </span>
                    </div>
                    {tomorrowsTasks?.length > 0 ? (
                      <ul className="flex flex-col gap-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                        {tomorrowsTasks.map((task) => (
                          <li
                            key={task._id}
                            className="group/item flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-600"
                            onClick={() => handleOpenDetail(task)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-500 hover:border-blue-400 transition-colors shrink-0"
                                onClick={(e) => handleToggleCompleted(e, task)}
                              >
                                <div className="w-2.5 h-2.5 bg-blue-400 rounded-sm opacity-0 hover:opacity-100 transition-opacity"></div>
                              </div>
                              <span className="truncate text-gray-300 text-sm group-hover/item:text-white font-medium">
                                {task.title}
                              </span>
                            </div>
                            <div
                              onClick={(e) => handleToggleImportant(e, task)}
                              className="w-6 h-6 flex items-center justify-center shrink-0 cursor-pointer hover:scale-110 transition-transform"
                            >
                              <div
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  task.isimportant
                                    ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                                    : 'bg-transparent border border-gray-500 hover:border-red-500'
                                }`}
                              ></div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-gray-500 text-xs py-4">
                        할 일이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. Auth Section (Fixed at bottom) */}
          <div className="w-full shrink-0 flex justify-center z-10 mt-auto">
            {isAuth ? (
              <div className="auth-button w-full flex items-center justify-center">
                {
                  // //! [Original Code] 정적인 형태의 로그인 버튼 (축소 시에도 형태 유지되어 가독성 저하)
                  // //! <button
                  // //!   className="group flex items-center bg-gray-300 text-gray-900 py-3 rounded-md transition-all duration-300 w-fit px-6 gap-2 justify-center shadow-md hover:bg-red-100"
                  // //!   onClick={handleLogoutClick}
                  // //!   title="Logout"
                  // //! >
                  // //!   <div className="flex items-center gap-2 group-hover:invisible">
                  // //!     <FcGoogle className="w-5 h-5 shrink-0" />
                  // //!     <span className="block text-sm truncate font-medium">
                  // //!       {name ? `${name}님 환영합니다!` : 'Logout'}
                  // //!     </span>
                  // //!   </div>
                  // //!   <div className="absolute inset-0 flex items-center justify-center gap-2 text-red-600 font-bold invisible group-hover:visible">
                  // //!     <MdLogout className="w-5 h-5 shrink-0" />
                  // //!     <span
                  // //!       className={`block text-sm ${isDesktopOpen ? 'block' : 'hidden'}`}
                  // //!     >
                  // //!       Logout
                  // //!     </span>
                  // //!   </div>
                  // //! </button>
                  // //* [Modified Code] Collapsed 상태 대응: 축소 시 원형 버튼으로 전환 및 프로필 이미지(있을 시) 노출
                }
                <button
                  className={`group flex items-center bg-gray-300 text-gray-900 transition-all duration-300 justify-center shadow-md hover:bg-red-100 relative
    ${isDesktopOpen ? 'py-3 rounded-md w-fit px-6 gap-2' : 'w-10 h-10 rounded-full mx-auto'}`}
                  onClick={handleLogoutClick}
                  title="Logout"
                >
                  {
                    // //* 정적 상태: 아이콘/프로필 + 이름(확장 시에만)
                  }
                  <div
                    className={`flex items-center gap-2 group-hover:invisible ${!isDesktopOpen ? 'justify-center' : ''}`}
                  >
                    {picture ? (
                      <img
                        src={picture}
                        alt="profile"
                        className={`${isDesktopOpen ? 'w-5 h-5' : 'w-6 h-6'} rounded-full shrink-0 object-cover`}
                      />
                    ) : (
                      <FcGoogle
                        className={`${isDesktopOpen ? 'w-5 h-5' : 'w-6 h-6'} shrink-0`}
                      />
                    )}
                    <span
                      className={`text-sm truncate font-medium ${isDesktopOpen ? 'block' : 'hidden'}`}
                    >
                      {name ? `${name}님 환영합니다!` : 'Logout'}
                    </span>
                  </div>

                  {
                    // //* 호버 상태: 로그아웃 아이콘으로 전환
                  }
                  <div
                    className={`absolute inset-0 flex items-center justify-center gap-2 text-red-600 font-bold invisible group-hover:visible ${!isDesktopOpen ? 'bg-red-100 rounded-full' : ''}`}
                  >
                    <MdLogout
                      className={`${isDesktopOpen ? 'w-5 h-5' : 'w-6 h-6'} shrink-0`}
                    />
                    <span
                      className={`text-sm ${isDesktopOpen ? 'block' : 'hidden'}`}
                    >
                      Logout
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="auth-warpper flex justify-center w-full login-btn">
                {isDesktopOpen ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <div className="w-full px-4">
                      <GoogleLogin
                        onSuccess={handleLoginSuccess}
                        onError={handleLoginError}
                        width="100%"
                      />
                      <button className="flex justify-center items-center gap-2 bg-gray-300 text-gray-500 py-3 px-4 rounded-md w-full mt-2 whitespace-nowrap">
                        <FcGoogle className="w-5 h-5" />
                        <span className="text-sm">Google Login</span>
                      </button>
                    </div>
                  </GoogleOAuthProvider>
                ) : (
                  <button
                    onClick={() => setIsDesktopOpen(true)}
                    className="bg-gray-300 w-10 h-10 flex justify-center items-center rounded-full hover:bg-white transition-colors mx-auto"
                    title="Login"
                  >
                    <FcGoogle className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
