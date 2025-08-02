import React, { useState, useEffect } from 'react'
import { googleAI } from '../services/googleAI-enhanced'

interface PerformanceStatsProps {
  isVisible: boolean
  onToggle: () => void
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ isVisible, onToggle }) => {
  const [stats, setStats] = useState<any>(null)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null)

  useEffect(() => {
    if (isVisible) {
      // Update stats immediately
      updateStats()
      
      // Set up auto-refresh every 5 seconds
      const interval = setInterval(updateStats, 5000)
      setRefreshInterval(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }, [isVisible])

  const updateStats = () => {
    const currentStats = googleAI.getPerformanceStats()
    setStats(currentStats)
  }

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="แสดงสถิติประสิทธิภาพ"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">⚡ Performance Stats</h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 text-xl"
          title="ปิด"
        >
          ✕
        </button>
      </div>

      {stats ? (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">
              🔑 Total API Keys: {stats.totalApis}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              เพิ่ม API Keys ใน .env เพื่อความเร็วมากขึ้น
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">API Performance:</h4>
            {stats.stats.map((apiStat: any, index: number) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-xs ${
                  apiStat.isHealthy 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {apiStat.isHealthy ? '🟢' : '🔴'} API #{apiStat.apiIndex}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    apiStat.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {apiStat.successRate}
                  </span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div>📈 {apiStat.requests} req</div>
                  <div>❌ {apiStat.errors} err</div>
                  <div>⏱️ {apiStat.avgResponseTime}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 p-2 rounded-lg">
            <div className="text-xs text-yellow-800">
              💡 <strong>Tips สำหรับความเร็ว:</strong>
              <ul className="mt-1 space-y-1 list-disc list-inside">
                <li>สร้าง API Keys เพิ่มใน Google AI Studio</li>
                <li>ไฟล์ใหญ่ {'>'}8MB จะใช้ Parallel Processing</li>
                <li>gemini-1.5-flash เร็วกว่า Pro</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            อัพเดทอัตโนมัติทุก 5 วินาที
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <div className="text-sm text-gray-600 mt-2">กำลังโหลดสถิติ...</div>
        </div>
      )}
    </div>
  )
}
