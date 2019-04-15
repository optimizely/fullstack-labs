import * as React from 'react'

type WelcomeProps = {
  title: string
  children: any
}

const Example: React.SFC<WelcomeProps> = ({
  title = '',
  children,
}: {
  title: string
  children: any
}) => {
  return (
    <div className="example">
      <h5 className="example-title">{title}</h5>
      <div className="example-body">{children}</div>
    </div>
  )
}

export default Example
