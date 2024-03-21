import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <footer>
      <nav>
        <ul>
          <li>
            <NavLink to='info'>info</NavLink>
          </li>
          <li>
            <NavLink to='settings'>settings</NavLink>
          </li>
          <li>
            <NavLink to=''>chords</NavLink>
          </li>
        </ul>
      </nav>
    </footer>
  )
}

export default Navigation;