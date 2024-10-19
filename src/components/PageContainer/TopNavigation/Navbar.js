import {BsFillMoonStarsFill,BsFillSunFill} from 'react-icons/bs'
import {GiHamburgerMenu} from 'react-icons/gi';
// import useDarkMode from '../../../hooks/useDarkMode';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserAuth } from '../../context/AuthContext';

const Navbar = (props) => {
  
  const [showloginMenu, setShowLoginMenu] = useState(true);
  // const [darkTheme, setDarkTheme] = useDarkMode();
  const {user} = UserAuth();

  useEffect(() => {
    if(user !== null){
      setShowLoginMenu(false);
      // console.log(typeof(user));
    }
    else{
      setShowLoginMenu(true);
    }
  }, [user])



    return (
        <div className='navbar'>
          <button onClick={() => props.setsideNavMenu(!props.sideNavMenu) }>
          <GiHamburgerMenu size='32' className='burger-icon' />
          </button>
          <Title text = "Aston Air Quality Dashboard"/>
          <ThemeIcon darkTheme={props.darkTheme} setDarkTheme={props.setDarkTheme}/>
          <UserMenu showloginMenu = {showloginMenu}/>
        </div>
    );
  };


const ThemeIcon = ({darkTheme,setDarkTheme}) => {
    // const [darkTheme, setDarkTheme] = useDarkMode();
    const handleMode = () => setDarkTheme(!darkTheme);
    return (
      <span onClick={handleMode}>
        {darkTheme ? (
          <BsFillSunFill size='24' className='navbar-icon' />
        ) : (
          <BsFillMoonStarsFill size='24' className='navbar-icon' />
        )}
      </span>
    );
  };

const UserMenu = ({showloginMenu}) => {

  const {logout} = UserAuth();
  
  async function handleSignOut(){
    try{
      await logout();
    }
    catch(err){
      console.log(err);
    }
  }

    if (showloginMenu) {
        return (
          <ul className="user-menu"> 
              <li className="user-menu-items">
                <Link to="/signin" >
                    sign in
                </Link>
              </li>
              <li className="user-menu-items">
                <Link to="/register" >
                    register
                </Link>
              </li>
          </ul>
        )
    }

    else{
      return (
        <ul className="user-menu"> 
            <li className="user-menu-items">
              <button onClick={handleSignOut}>
                  sign out
              </button>
            </li>
        </ul>
      )
    }
   
  }

  
  const Title = ({text = "default title"}) => <h5 className='title-text'>{text}</h5>;

export default Navbar;