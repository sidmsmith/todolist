export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export const getTimeUntilDue = (dueTime) => {
  const now = new Date();
  const due = new Date(dueTime);
  const diffMs = due - now;
  
  if (diffMs < 0) {
    // Overdue
    const absDiffMs = Math.abs(diffMs);
    const minutes = Math.floor(absDiffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return { text: `Overdue ${hours}h ${minutes % 60}m`, isOverdue: true };
    }
    return { text: `Overdue ${minutes} min`, isOverdue: true };
  } else {
    // Due in future
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return { text: `Due in ${hours}h ${minutes % 60}m`, isOverdue: false };
    }
    return { text: `Due in ${minutes} min`, isOverdue: false };
  }
};

export const getSnoozeTime = (snoozeOption) => {
  const now = new Date();
  
  switch(snoozeOption) {
    case '15min':
      return 15;
    case '30min':
      return 30;
    case '1hour':
      return 60;
    case '4hours':
      return 240;
    case 'eod':
      // Calculate minutes until end of day (5 PM)
      const eod = new Date(now);
      eod.setHours(17, 0, 0, 0);
      if (eod <= now) eod.setDate(eod.getDate() + 1);
      return Math.floor((eod - now) / 60000);
    default:
      return 15;
  }
};