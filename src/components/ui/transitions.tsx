import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// Fade In/Out Transition
interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show,
  duration = 0.3,
  className
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Slide Transition
interface SlideTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  className?: string;
}

const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  show,
  direction = 'up',
  duration = 0.3,
  className
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { y: 20, opacity: 0 };
      case 'down': return { y: -20, opacity: 0 };
      case 'left': return { x: 20, opacity: 0 };
      case 'right': return { x: -20, opacity: 0 };
      default: return { y: 20, opacity: 0 };
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={getInitialPosition()}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={getInitialPosition()}
          transition={{ duration, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Scale Transition
interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

const ScaleTransition: React.FC<ScaleTransitionProps> = ({
  children,
  show,
  duration = 0.2,
  className
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Stagger Animation for Lists
interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  itemClassName?: string;
}

const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  itemClassName
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className={itemClassName}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Loading State Transition
interface LoadingStateTransitionProps {
  isLoading: boolean;
  loadingComponent: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const LoadingStateTransition: React.FC<LoadingStateTransitionProps> = ({
  isLoading,
  loadingComponent,
  children,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loadingComponent}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Cart Animation (for adding items)
interface CartAnimationProps {
  trigger: number;
  children: React.ReactNode;
  className?: string;
}

const CartAnimation: React.FC<CartAnimationProps> = ({
  trigger,
  children,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <motion.div
      animate={isAnimating ? {
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0]
      } : {}}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Notification Animation
interface NotificationAnimationProps {
  show: boolean;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

const NotificationAnimation: React.FC<NotificationAnimationProps> = ({
  show,
  children,
  position = 'top',
  className
}) => {
  const getAnimationProps = () => {
    if (position === 'top') {
      return {
        initial: { y: -100, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -100, opacity: 0 }
      };
    }
    return {
      initial: { y: 100, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 100, opacity: 0 }
    };
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          {...getAnimationProps()}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hover Animation Wrapper
interface HoverAnimationProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

const HoverAnimation: React.FC<HoverAnimationProps> = ({
  children,
  scale = 1.05,
  className
}) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export {
  FadeTransition,
  SlideTransition,
  ScaleTransition,
  StaggeredList,
  LoadingStateTransition,
  CartAnimation,
  PageTransition,
  NotificationAnimation,
  HoverAnimation
};