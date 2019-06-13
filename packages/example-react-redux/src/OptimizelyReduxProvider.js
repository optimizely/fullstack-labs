import { React } from 'react'
import { OptimizelyProvider } from '@optimizely/react-sdk'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  user: state.user,
})

const OptimizelyReduxProvider = props => {
  console.log('rendering OptimizelyReduxProvider', props)
  return <OptimizelyProvider {...props} />
}

export default connect(mapStateToProps)(OptimizelyProvider)
