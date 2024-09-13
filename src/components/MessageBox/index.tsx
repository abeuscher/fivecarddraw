// MessageBox.tsx

import React from 'react'
import { RootState } from '@/store'
import styles from './MessageBox.module.scss'
import { useSelector } from 'react-redux'

const MessageBox: React.FC = () => {
  const message = useSelector((state: RootState) => state.message)

  if (!message) return <div className={`${styles['message-box']}`}></div>

  return (
    <div className={`${styles['message-box']} ${styles[message.type]}`}>
      <h3>{message.message}</h3>
    </div>
  )
}

export default MessageBox
