import React, { useState, useEffect } from 'react';
import NotificationService from '../services/notificationService';

interface NotificationPermissionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionGranted: () => void;
  taskName?: string;
}

/**
 * Custom notification permission prompt with better UX than browser default.
 * Explains benefits and provides context for why notifications are useful.
 */
const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  isOpen,
  onClose,
  onPermissionGranted,
  taskName
}) => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [showBrowserBlocked, setShowBrowserBlocked] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    
    try {
      const result = await NotificationService.requestPermission();
      
      if (result.granted) {
        onPermissionGranted();
        onClose();
      } else if (result.showCustomPrompt) {
        setShowBrowserBlocked(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setShowBrowserBlocked(true);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleMaybeLater = () => {
    onClose();
  };

  const handleOpenSettings = () => {
    // Show instructions for enabling notifications manually
    setShowBrowserBlocked(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold">Stay on Track! 🎯</h3>
              <p className="text-white/90 text-sm">Get timely reminders for your tasks</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showBrowserBlocked ? (
            <>
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Why enable notifications?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Never miss important tasks</p>
                      <p className="text-xs text-gray-600">Get gentle reminders at the perfect time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Boost your productivity</p>
                      <p className="text-xs text-gray-600">Stay focused and accomplish more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Celebrate achievements</p>
                      <p className="text-xs text-gray-600">Get notified when you earn coins and badges</p>
                    </div>
                  </div>
                </div>
              </div>

              {taskName && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Ready to start:</span> "{taskName}"
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Enable notifications to get reminded at the perfect time!
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleEnableNotifications}
                  disabled={isRequesting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  {isRequesting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enabling...
                    </div>
                  ) : (
                    'Enable Notifications'
                  )}
                </button>
                
                <button
                  onClick={handleMaybeLater}
                  className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Notifications Blocked</h4>
                <p className="text-sm text-gray-600 mb-4">
                  It looks like notifications have been blocked in your browser. To enable task reminders:
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="font-medium text-gray-900 mb-2">For Safari on Mac:</h5>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click Safari → Settings</li>
                  <li>Go to Websites → Notifications</li>
                  <li>Find this website and set to "Allow"</li>
                </ol>
                
                <h5 className="font-medium text-gray-900 mb-2 mt-4">For Chrome on Mac:</h5>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click the 🔒 icon in the address bar</li>
                  <li>Set Notifications to "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  I'll Do This Later
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                >
                  Refresh Page
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;