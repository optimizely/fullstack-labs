import { OptimizelyProvider } from '@optimizely/react-sdk'
import { connect } from 'react-redux'

const mapStateToProps = state => ({
  user: state.user,
})

export default connect(mapStateToProps)(OptimizelyProvider)
