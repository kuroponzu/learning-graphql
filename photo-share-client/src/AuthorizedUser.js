import { Query, Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { ROOT_QUERY } from './App'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

require('dotenv').config()


const GITHUB_AUTH_MUTATION = gql`
  mutation guthubAuth($code:String!){
    githubAuth(code:$code){ token }
  }
`

const Me = ({ logout, requestCode, signingIn }) =>
    <Query query={ ROOT_QUERY } >
        {({ loading, data }) => data?.me ?
            <CurrentUser {...data.me} logout={logout} /> :
            loading ?
                <p>loading... </p> :
                <button onClick={requestCode}
                    disabled={signingIn}>
                    Sign In with Github
                </button>
        }
    </Query>

const CurrentUser = ({name, avatar, logout }) =>
  <div>
    <img src={avatar} width={48} height={48} alt="" />
    <h1>{name}</h1>
    <button onClick={logout}>logout</button>
  </div>


class AuthorisedUser extends Component {
  state = { siginigIn: false }

  authorizationComplete = ( cache, { data }) => {
    localStorage.setItem('token', data.githubAuth.token)
    this.props.history.replace('/')
    this.setState({ siginigIn: false })
  }

  componentDidMount(){
    if (window.location.search.match(/code=/)){
      this.setState({ siginigIn: true })
      const code = window.location.search.replace("?code=", "")
      this.githubAuthMutation({ variables: { code } })
    }
  }

  requestCode(){
    var clientID = process.env.REACT_APP_GITHUB_CLIENT_ID
    window.location = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=user`
  }

  render(){
    return(
      <Mutation
        mutation={GITHUB_AUTH_MUTATION}
        update={this.authorizationComplete}
        refetchQueries={[{ query: ROOT_QUERY }]}>
        {mutation => {
          this.githubAuthMutation = mutation
          return (
            <Me
              signingIn={ this.state.signingIn }
              requestCode={this.requestCode}
              logout={() => localStorage.removeItem('token')}
            />
          )
        }}
      </Mutation>
    )
  }
}

export default withRouter(AuthorisedUser)
