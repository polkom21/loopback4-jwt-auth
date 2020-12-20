import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HeaderComponent from './components/HeaderComponent';
import LoginComponent from './components/LoginComponent';
import fetcher from './helpers/fetcher';

function App() {

  const dispatch = useDispatch()

  useEffect(() => {
    const cookies = document.cookie
    const decodedCookies = decodeURIComponent(cookies).split(';')
    const cookiesParsed = Object.fromEntries(decodedCookies.map(c => c.trim().split('=')))
    if (cookiesParsed.headerpayload) {
      dispatch({
        type: 'AUTH_LOGIN', payload: {
          user: JSON.parse(atob(cookiesParsed.headerpayload.split('.')[1]))
        }
      })
      fetcher('GET', '/users/me')
        .then(profile => {
          dispatch({
            type: 'AUTH_LOGIN', payload: {
              logged: true,
              user: profile,
            }
          })
        })
        .catch(err => { })
    }
  }, [dispatch])

  return (
    <div className="App">
      <Router>
        <HeaderComponent />

        <Switch>
          <Route path="/" exact component={() => <h1>Home</h1>} />
          <Route path="/login" component={LoginComponent} />
          <Route path="/register" component={() => <h1>Register</h1>} />
          <Route path="/profile" component={() => <h1>Profile</h1>} />
        </Switch>

      </Router>
    </div>
  );
}

export default App;
