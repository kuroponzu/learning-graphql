import { Query, Mutation, withApollo } from 'react-apollo'
import { compose } from 'recompose'
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
    <Query query={ ROOT_QUERY } fetchPolicy="cache-and-network">
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

  logout = () => {
    localStorage.removeItem('token')
    let data = this.props.client.readQuery({ query: ROOT_QUERY })
    data.me = null
    this.props.client.writeQuery({ query: ROOT_QUERY, data })
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
              logout={this.logout}
            />
          )
        }}
      </Mutation>
    )
  }
}

export default compose(withApollo,withRouter)(AuthorisedUser)
