import { BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserAuth } from '../../context/AuthContext.tsx';
import { useDarkModeContext } from '../../context/DarkModeContext.tsx';

type NavbarProps = {
  sideNavMenu: boolean;
  setsideNavMenu: (value: boolean) => void;
};

const Navbar: React.FC<NavbarProps> = ({ sideNavMenu, setsideNavMenu }) => {
  const [showLoginMenu, setShowLoginMenu] = useState(true);
  const [darkTheme, setDarkTheme] = useDarkModeContext();
  const { user, logout } = UserAuth();

  useEffect(() => {
    setShowLoginMenu(user === null);
  }, [user]);

  return (
    <div className='navbar'>
      <button onClick={() => setsideNavMenu(!sideNavMenu)}>
        <GiHamburgerMenu size={32} className='burger-icon' />
      </button>
      <Title text="Aston University Air Quality Dashboard" />
      <ThemeIcon darkTheme={darkTheme} setDarkTheme={setDarkTheme} />
      <UserMenu showLoginMenu={showLoginMenu} logout={logout} />
    </div>
  );
};

type ThemeIconProps = {
  darkTheme: boolean;
  setDarkTheme: (value: boolean) => void;
};

const ThemeIcon: React.FC<ThemeIconProps> = ({ darkTheme, setDarkTheme }) => {
  const handleMode = () => setDarkTheme(!darkTheme);
  return (
    <span onClick={handleMode}>
      {darkTheme ? (
        <BsFillSunFill size={24} className='navbar-icon' />
      ) : (
        <BsFillMoonStarsFill size={24} className='navbar-icon' />
      )}
    </span>
  );
};

type UserMenuProps = {
  showLoginMenu: boolean;
  logout: () => void;
};

const UserMenu: React.FC<UserMenuProps> = ({ showLoginMenu, logout }) => {
  const handleSignOut = async () => {
    try {
      logout();
    } catch (err) {
      console.log(err);
    }
  };

  if (showLoginMenu) {
    return (
      <ul className="user-menu">
        <li className="user-menu-items">
          <Link to="/signin">sign in</Link>
        </li>
        <li className="user-menu-items">
          <Link to="/register">register</Link>
        </li>
      </ul>
    );
  } else {
    return (
      <ul className="user-menu">
        <li className="user-menu-items">
          <button onClick={handleSignOut}>sign out</button>
        </li>
      </ul>
    );
  }
};

type TitleProps = {
  text?: string;
};

const Title: React.FC<TitleProps> = ({ text = "default title" }) => (
  <h5 className='title-text'>{text}</h5>
);

export default Navbar;
