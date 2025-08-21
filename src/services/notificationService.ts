/**
 * Enhanced notification service optimized for macOS Safari and Chrome
 * Follows 2025 best practices for web push notifications
 */

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  renotify?: boolean;
  requireInteraction?: boolean;
  actions?: { action: string; title: string; icon?: string }[];
  data?: any;
}

export interface NotificationPermissionResult {
  granted: boolean;
  showCustomPrompt: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private permissionRequested = false;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if notifications are supported in this browser
   */
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Get current notification permission status
   */
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  /**
   * Request notification permission with improved UX
   * Returns both permission status and whether to show custom prompt
   */
  public async requestPermission(): Promise<NotificationPermissionResult> {
    if (!this.isSupported()) {
      return { granted: false, showCustomPrompt: false };
    }

    // If already granted
    if (Notification.permission === 'granted') {
      return { granted: true, showCustomPrompt: false };
    }

    // If denied, suggest custom prompt for re-engagement
    if (Notification.permission === 'denied') {
      return { granted: false, showCustomPrompt: true };
    }

    // First time request - show custom prompt first for better conversion
    if (!this.permissionRequested) {
      this.permissionRequested = true;
      return { granted: false, showCustomPrompt: true };
    }

    // Direct permission request
    try {
      const permission = await Notification.requestPermission();
      return { 
        granted: permission === 'granted', 
        showCustomPrompt: permission === 'denied' 
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, showCustomPrompt: true };
    }
  }

  /**
   * Show enhanced notification with macOS optimization
   */
  public async showNotification(config: NotificationConfig): Promise<Notification | null> {
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Optimize content for different browsers
    const optimizedConfig = this.optimizeForPlatform(config);

    try {
      const notificationOptions: any = {
        body: optimizedConfig.body,
        icon: optimizedConfig.icon,
        badge: optimizedConfig.badge,
        tag: optimizedConfig.tag || 'task-app',
        renotify: optimizedConfig.renotify || false,
        requireInteraction: optimizedConfig.requireInteraction || false,
        data: optimizedConfig.data,
      };

      // Only add image if supported (not in standard NotificationOptions)
      if (optimizedConfig.image) {
        notificationOptions.image = optimizedConfig.image;
      }

      // Only add actions if supported (not supported in all browsers)
      if (optimizedConfig.actions && optimizedConfig.actions.length > 0) {
        notificationOptions.actions = optimizedConfig.actions;
      }

      const notification = new Notification(optimizedConfig.title, notificationOptions);

      // Add click handler
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Handle custom data
        if (config.data?.action) {
          this.handleNotificationAction(config.data.action, config.data);
        }
      };

      // Auto-close after 8 seconds for better UX
      setTimeout(() => {
        notification.close();
      }, 8000);

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  /**
   * Optimize notification content for different platforms
   */
  private optimizeForPlatform(config: NotificationConfig): NotificationConfig {
    const userAgent = navigator.userAgent;
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    
    if (isSafari) {
      // Safari limitations: 40 char title, 90 char body
      return {
        ...config,
        title: this.truncateText(config.title, 40),
        body: this.truncateText(config.body, 90),
        icon: config.icon || '/rewards/icons/notification-icon-256.png',
        // Safari doesn't support actions or images well
        actions: undefined,
        image: undefined,
      };
    } else {
      // Chrome and other browsers: 60-80 char title, 20-80 char body
      return {
        ...config,
        title: this.truncateText(config.title, 60),
        body: this.truncateText(config.body, 80),
        icon: config.icon || '/rewards/icons/notification-icon-192.png',
        badge: config.badge || '/rewards/icons/notification-badge-72.png',
      };
    }
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1).trim() + '…';
  }

  /**
   * Handle notification action clicks
   */
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'complete_task':
        // Dispatch custom event for task completion
        window.dispatchEvent(new CustomEvent('notificationTaskComplete', { 
          detail: data 
        }));
        break;
      case 'snooze_reminder':
        // Dispatch custom event for snoozing
        window.dispatchEvent(new CustomEvent('notificationSnooze', { 
          detail: data 
        }));
        break;
      case 'view_tasks':
        // Focus on tasks tab
        window.focus();
        break;
      default:
        window.focus();
    }
  }

  /**
   * Show task reminder notification with enhanced design
   */
  public async showTaskReminder(taskName: string, taskId: string): Promise<Notification | null> {
    const config: NotificationConfig = {
      title: '📋 Task Reminder',
      body: `Time to work on: ${taskName}`,
      icon: '/rewards/icons/notification-icon-256.png',
      badge: '/rewards/icons/notification-badge-72.png',
      tag: `task-reminder-${taskId}`,
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: 'complete_task',
          title: '✅ Mark Complete',
          icon: '/rewards/icons/check-icon-32.png'
        },
        {
          action: 'snooze_reminder',
          title: '⏰ Snooze 15min',
          icon: '/rewards/icons/snooze-icon-32.png'
        }
      ],
      data: {
        action: 'task_reminder',
        taskId,
        taskName
      }
    };

    return this.showNotification(config);
  }

  /**
   * Show task completion celebration notification
   */
  public async showTaskComplete(taskName: string, points: number): Promise<Notification | null> {
    const config: NotificationConfig = {
      title: '🎉 Task Completed!',
      body: `Great job completing "${taskName}"! You earned ${points} coins.`,
      icon: '/rewards/icons/celebration-icon-256.png',
      badge: '/rewards/icons/notification-badge-72.png',
      tag: 'task-complete',
      requireInteraction: false,
      data: {
        action: 'task_complete',
        taskName,
        points
      }
    };

    return this.showNotification(config);
  }

  /**
   * Show achievement unlock notification
   */
  public async showAchievement(title: string, description: string): Promise<Notification | null> {
    const config: NotificationConfig = {
      title: `🏆 ${title}`,
      body: description,
      icon: '/rewards/icons/achievement-icon-256.png',
      badge: '/rewards/icons/notification-badge-72.png',
      tag: 'achievement',
      requireInteraction: true,
      data: {
        action: 'achievement',
        title
      }
    };

    return this.showNotification(config);
  }

  /**
   * Clear all notifications with specific tag
   */
  public clearNotifications(tag?: string): void {
    // This would require service worker registration for full implementation
    // For now, we rely on auto-close timeouts
    console.log(`Clearing notifications${tag ? ` with tag: ${tag}` : ''}`);
  }
}

export default NotificationService.getInstance();