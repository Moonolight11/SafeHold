import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TabBar from './TabBar'

interface LayoutProps {
  children: React.ReactNode
  showTab?: boolean
}

const Layout: React.FC<LayoutProps> = ({ children, showTab = true }) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative bg-dark-base">
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      {showTab && <TabBar />}
    </div>
  )
}

export default Layout
