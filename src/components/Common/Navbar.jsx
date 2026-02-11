import React, { useCallback, useState, useEffect } from 'react';
import {
  MdMenu,
  MdClose,
  MdLogin,
  MdLogout,
  MdPerson,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from 'react-icons/md'; // 아이콘 추가
import { Link, useLocation } from 'react-router-dom';
import { navMenus } from '../../utils/naviList';
import { FcGoogle } from 'react-icons/fc';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../../redux/slices/authSlice';

// //* 개인적으로 정리해볼 것
const Navbar = () => {
  const path = useLocation();
  const isActive = (location) => path.pathname === location;

  const googleClientId = import.meta.env.VITE_AUTH_CLIENT_ID;
  // console.log(googleClientId);

  const dispatch = useDispatch();
  const state = useSelector((state) => state.auth.authData);
  // console.log(state);
  const { name } = state || {};

  //  !: 부정 !!name: name 값이 있는지 엄격히 체크 -> name이 존재하면 true, null이면 false
  const [isAuth, setIsAuth] = useState(!!name);

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
        // console.log(decoded);
      } catch (error) {
        console.error('Google Login Error: ', error);
      }
    },
    [dispatch],
  );

  const handleLogoutClick = () => {
    dispatch(logout());
    setIsAuth(false);
  };

  const handleLoginError = (error) => {
    console.log('Google Login Error: ', error);
  };

  return (
    <>
      {/* //* [Modified Code] 모바일/태블릿용 햄버거 메뉴 버튼 */}
      {/* 화면 좌측 상단에 고정되어 메뉴를 열 수 있는 트리거 역할 */}
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
            <Link to="/">MARSHALL</Link>
          </h2>
        </div>

        {/* Right: Login/Profile Action */}
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

      {/* //* [Modified Code] Sidebar (Mini Sidebar Architecture) */}
      {/* 1. collapsed(mini): w-20 (80px) / expanded(full): w-72 (288px) */}
      {/* 2. mini 모드일 때 텍스트는 숨기고 아이콘만 중앙 정렬 */}
      {/* 3. lg:relative를 사용하여 문서 흐름 유지 (본문 패널과 겹치지 않음) */}
      {/* // //! [Original Code] */}
      {/* // justify-between: 상단 로고, 하단 로그인이 양끝에 배치됨 */}
      {/* // fixed top-0 ... lg:w-0: 데스크탑에서 닫히면 완전히 사라짐 */}

      {/* // //* [Modified Code] */}
      {/* // 1. justify-start: 로고와 메뉴를 상단으로 그룹핑하여 배치 */}
      {/* // 2. py-10 px-4: 모바일 화면에서 상단 여백 확보 */}
      {/* // 3. lg:w-20: Mini Sidebar 모드 (닫혔을 때 80px 너비 유지) */}
      <nav
        className={`bg-[#212121] h-full rounded-r-sm border-r border-gray-500 flex flex-col justify-start items-center 
        fixed top-0 left-0 z-50 w-64 py-10 px-4 lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDesktopOpen ? 'lg:w-72 lg:py-10 lg:px-4' : 'lg:w-20 lg:py-10 lg:px-2'}
        `}
      >
        {/* Desktop Close Button (Only visible when expanded) */}
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
          onClick={toggleSidebar}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <MdClose className="w-6 h-6" />
        </button>

        {/* Logo Section */}
        {/* // //! [Original Code] */}
        {/* // <div className="logo shrink-0"></div> */}
        {/* // 단순히 로고만 배치함. padding issue로 인해 정렬이 틀어짐. */}

        {/* // //* [Modified Code] */}
        {/* // w-[50px] padding visual fix: */}
        {/* // 로고의 가상요소(::before) 20px을 포함한 실제 크기(50px)를 컨테이너로 감싸서 */}
        {/* // 1) 텍스트 겹침 방지, 2) Mini 모드 중앙 정렬을 완벽하게 구현 */}
        <div
          className={`logo-wrapper flex w-full items-center gap-4 transition-all duration-300 ${
            isDesktopOpen
              ? 'justify-center pl-0' // //* [Modified Code] justify-start -> justify-center (Center Alignment 요청 반영), pl-2 제거
              : 'justify-center w-full px-0 cursor-pointer hover:bg-gray-800 py-2'
          }`}
          onClick={() => !isDesktopOpen && setIsDesktopOpen(true)}
          title={!isDesktopOpen ? 'Click to Expand' : ''}
        >
          <div className="w-[50px] h-[30px] relative shrink-0">
            <div className="logo"></div>
          </div>
          {/* 텍스트는 Expanded 상태에서만 노출 */}
          <h2
            className={`font-semibold text-xl whitespace-nowrap transition-opacity duration-300 ${
              isDesktopOpen ? 'opacity-100' : 'opacity-0 hidden'
            }`}
          >
            <Link to="/">MARSHALL</Link>
          </h2>
        </div>

        {/* Menu List */}
        {/* // //! [Original Code] */}
        {/* // px-6 gap-x-4: 항상 고정된 패딩 사용 */}

        {/* // //* [Modified Code] */}
        {/* // Desktop: px-6 (기존 유지) */}
        {/* // Mini: px-0 w-full justify-center (아이콘 중앙 정렬 강제) */}
        {/* // //* [Vertical Alignment Fix] mt-8 대신 my-auto를 사용하여 상하 중앙 정렬 구현 */}
        <ul className="menus w-full my-auto">
          {navMenus.map((menu, idx) => (
            <li
              key={idx}
              className={`rounded-sm mb-2 border border-gray-700 hover:bg-gray-950 transition-all duration-300 ${
                isActive(menu.to)
                  ? 'bg-gray-950 border-gray-500'
                  : 'border-transparent'
              }`}
            >
              <Link
                to={menu.to}
                className={`flex items-center py-3 transition-all duration-300 ${
                  isDesktopOpen
                    ? 'px-6 gap-x-4 justify-start' // //* [Modified Code] justify-center -> justify-start (가로 정렬 원복 요청 반영)
                    : 'px-0 justify-center w-full'
                }`}
                title={!isDesktopOpen ? menu.label : ''} // Mini 모드일 때 툴팁 제공
              >
                <div className="text-xl flex items-center justify-center">
                  {menu.icon}
                </div>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isDesktopOpen ? 'opacity-100 block' : 'opacity-0 hidden w-0'
                  }`}
                >
                  {menu.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Section */}
        {/* // //! [Original Code] */}
        {/* // mb-4: 단순 하단 여백만 적용 */}

        {/* // //* [Modified Code] */}
        {/* // 1. mt-auto: 부모 컨테이너(flex-col)에서 남은 공간을 모두 차지하여 맨 아래로 밀어냄 */}
        {/* // 2. mx-auto: Mini 모드에서 버튼 중앙 정렬 보장 */}
        <div className="w-full flex justify-center mb-4 mt-auto">
          {isAuth ? (
            <div className="auth-button w-full flex items-center justify-center">
              <button
                className={`group flex items-center bg-gray-300 text-gray-900 py-3 rounded-md transition-all duration-300 ${
                  isDesktopOpen
                    ? 'w-full px-4 gap-2 justify-start'
                    : 'w-10 h-10 px-0 justify-center rounded-full mx-auto'
                } hover:bg-red-100`}
                onClick={handleLogoutClick}
                title="Logout"
              >
                {/* // //! [Original Code] */}
                {/* // <FcGoogle /> 단일 아이콘 */}

                {/* // //* [Modified Code] */}
                {/* // Hover Based UX: */}
                {/* // 1. 평상시: Google 아이콘 (Profile) */}
                {/* // 2. 마우스 오버: Logout 아이콘 + Red Color (Action Warning) */}
                <FcGoogle className="w-5 h-5 shrink-0 group-hover:hidden" />
                <MdLogout className="w-5 h-5 shrink-0 hidden group-hover:block text-red-600" />

                {/* Text Swap: Hover 시 이름 -> Logout (Expanded 모드 전용) */}
                <span
                  className={`${isDesktopOpen ? 'block' : 'hidden'} text-sm truncate flex-1 text-left`}
                >
                  <span className="group-hover:hidden font-medium">
                    {name ? `${name}님` : 'Logout'}
                  </span>
                  <span className="hidden group-hover:block text-red-600 font-bold">
                    Logout
                  </span>
                </span>
              </button>
            </div>
          ) : (
            <div className="auth-warpper flex justify-center w-full login-btn">
              {isDesktopOpen ? (
                // 사이드바 확장 시: 정식 구글 로그인 버튼
                <GoogleOAuthProvider clientId={googleClientId}>
                  <div className="w-full">
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
                // 사이드바 축소 시: 아이콘 버튼만 노출 (클릭 시 확장 유도)
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
      </nav>
    </>
  );
};

export default Navbar;
