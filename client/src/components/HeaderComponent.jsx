import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function HeaderComponent() {
  const user = useSelector(state => state.Auth?.user);
  const logged = useSelector(state => state.Auth?.logged);

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-primary">
      <Link className="navbar-brand" to="/">Client app</Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">Home</Link>
          </li>
        </ul>
        {logged && user ?
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <span className="nav-link">Hello {user.name}</span>
            </li>
          </ul> :
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Register</Link>
            </li>
          </ul>}
      </div>
    </nav>
  )
}
