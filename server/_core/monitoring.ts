/**
 * Server Monitoring with Google Cloud Logging
 *
 * Express API 요청 및 에러를 Google Cloud Logging에 기록합니다.
 */

import { Logging } from '@google-cloud/logging';
import type { Request, Response, NextFunction } from 'express';

/**
 * Cloud Logging 클라이언트
 */
let loggingClient: Logging | null = null;
let apiLog: any = null;
let errorLog: any = null;

/**
 * Cloud Logging 초기화
 */
export function initializeMonitoring() {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID;

    if (!projectId) {
      console.warn('[Monitoring] GOOGLE_CLOUD_PROJECT가 설정되지 않았습니다. 로그는 콘솔만 출력됩니다.');
      return;
    }

    loggingClient = new Logging({
      projectId,
    });

    // 로그 이름 정의
    apiLog = loggingClient.log('hairkeeper-api');
    errorLog = loggingClient.log('hairkeeper-errors');

    console.log('[Monitoring] Cloud Logging 초기화 완료');
  } catch (error) {
    console.error('[Monitoring] Cloud Logging 초기화 실패:', error);
  }
}

/**
 * API 요청 로깅
 */
export function logApiCall(params: {
  method: string;
  path: string;
  statusCode: number;
  duration: number; // ms
  userId?: string;
  error?: string;
}) {
  const { method, path, statusCode, duration, userId, error } = params;

  // 콘솔 로그
  const logMessage = `[API] ${method} ${path} - ${statusCode} (${duration}ms)${userId ? ` - User: ${userId}` : ''}${error ? ` - Error: ${error}` : ''}`;

  if (statusCode >= 500) {
    console.error(logMessage);
  } else if (statusCode >= 400) {
    console.warn(logMessage);
  } else {
    console.log(logMessage);
  }

  // Cloud Logging에 기록
  if (apiLog) {
    const metadata = {
      severity: statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARNING' : 'INFO',
      httpRequest: {
        requestMethod: method,
        requestUrl: path,
        status: statusCode,
        latency: {
          seconds: Math.floor(duration / 1000),
          nanos: (duration % 1000) * 1000000,
        },
      },
      labels: {
        userId: userId || 'anonymous',
      },
    };

    const entry = apiLog.entry(metadata, {
      method,
      path,
      statusCode,
      duration,
      userId,
      error,
      timestamp: new Date().toISOString(),
    });

    apiLog.write(entry).catch((err: any) => {
      console.error('[Monitoring] Cloud Logging 기록 실패:', err);
    });
  }
}

/**
 * 에러 로깅
 */
export function logError(params: {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  request?: {
    method: string;
    path: string;
    body?: any;
    query?: any;
  };
}) {
  const { error, context, userId, request } = params;

  // 콘솔 에러
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    context,
    userId,
    request,
  });

  // Cloud Logging에 기록
  if (errorLog) {
    const metadata = {
      severity: 'ERROR',
      labels: {
        userId: userId || 'anonymous',
      },
    };

    const entry = errorLog.entry(metadata, {
      errorMessage: error.message,
      errorStack: error.stack,
      errorName: error.name,
      context,
      userId,
      request,
      timestamp: new Date().toISOString(),
    });

    errorLog.write(entry).catch((err: any) => {
      console.error('[Monitoring] Cloud Logging 에러 기록 실패:', err);
    });
  }
}

/**
 * Express 미들웨어: API 요청 로깅
 */
export function apiLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // 응답 완료 시 로그 기록
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = (req as any).user?.uid || undefined;

    logApiCall({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId,
    });
  });

  next();
}

/**
 * Express 에러 핸들러 미들웨어
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const userId = (req as any).user?.uid || undefined;

  logError({
    error: err,
    context: {
      url: req.url,
      method: req.method,
    },
    userId,
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
    },
  });

  // 에러 응답
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
}

/**
 * 비즈니스 로직 이벤트 로깅
 */
export function logBusinessEvent(params: {
  eventName: string;
  data: Record<string, any>;
  userId?: string;
}) {
  const { eventName, data, userId } = params;

  console.log(`[Event] ${eventName}`, {
    ...data,
    userId,
  });

  if (apiLog) {
    const metadata = {
      severity: 'INFO',
      labels: {
        eventName,
        userId: userId || 'anonymous',
      },
    };

    const entry = apiLog.entry(metadata, {
      eventName,
      ...data,
      userId,
      timestamp: new Date().toISOString(),
    });

    apiLog.write(entry).catch((err: any) => {
      console.error('[Monitoring] Cloud Logging 이벤트 기록 실패:', err);
    });
  }
}

/**
 * 성능 메트릭 로깅
 */
export function logPerformanceMetric(params: {
  metricName: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}) {
  const { metricName, value, unit, tags } = params;

  console.log(`[Metric] ${metricName}: ${value}${unit}`, tags);

  if (apiLog) {
    const metadata = {
      severity: 'INFO',
      labels: {
        metricName,
        ...tags,
      },
    };

    const entry = apiLog.entry(metadata, {
      metricName,
      value,
      unit,
      tags,
      timestamp: new Date().toISOString(),
    });

    apiLog.write(entry).catch((err: any) => {
      console.error('[Monitoring] Cloud Logging 메트릭 기록 실패:', err);
    });
  }
}
