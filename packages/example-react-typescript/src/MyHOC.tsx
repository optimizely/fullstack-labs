import * as React from 'react'
import { WithOptimizelyProps, UserWrappedOptimizelySDK, withOptimizely } from '@optimizely/react-sdk'

interface MyProps extends WithOptimizelyProps {
  title: string
}

const Example: React.SFC<MyProps> = ({
  title = '',
  optimizely,
}: {
  title: string
  optimizely: UserWrappedOptimizelySDK | null
}) => {
  if (optimizely === null) {
    throw new Error()
  }

  const variation = optimizely.getVariation('abtest1')

  return (
    <div className="example">
      <h5 className="example-title">{title}: {variation}</h5>
    </div>
  )
}

export default withOptimizely(Example)