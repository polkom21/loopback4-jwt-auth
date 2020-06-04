import React, { Suspense, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import fetcher from '../helpers/fetcher';

export default function LoginComponent() {
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const authUser = useSelector(state => state.Auth.user)
  const dispatch = useDispatch()
  const history = useHistory()

  // const { data, error } = useSWR(['POST', '/api/users/login', { email, password }], fetcher)
  // console.log(data, error)

  const removeCurrentUser = useCallback((e) => {
    e.preventDefault();
    if (authUser) {
      dispatch({
        type: 'AUTH_LOGIN',
        payload: {
          user: null,
        }
      })
    }
  }, [dispatch, authUser])

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      fetcher('POST', '/users/login', { email: authUser?.email || email, password })
        .then(res => {
          fetcher('GET', '/users/me')
            .then(profile => {
              dispatch({
                type: 'AUTH_LOGIN', payload: {
                  logged: true,
                  user: profile,
                }
              })
              history.push('/')
            })
        })
        .catch(error => {
          alert(error)
        })
    },
    [email, password, authUser, dispatch, history],
  )

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12 col-lg-6 mx-auto">
          <div className="card">
            <div className="card-header">Login form</div>
            <form onSubmit={onSubmit} className="card-body">
              {authUser ? <>
                <p>Hello {authUser.name}. Please authorise your access.</p>
                <p><button className="btn btn-primary" type="button" onClick={removeCurrentUser}>Or change user</button></p>
              </> : null}
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input className="form-control" required type="email" name="email" id="email" disabled={authUser?.email} value={authUser?.email || email} onChange={e => { setemail(e.target.value) }} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" required name="password" id="password" value={password} onChange={e => setpassword(e.target.value)} className="form-control" />
              </div>
              <Suspense fallback={<div>Loading...</div>}>
                <button type="submit" className="btn btn-primary">Login</button>
              </Suspense>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
