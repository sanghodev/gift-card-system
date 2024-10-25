// global.d.ts
import mongoose from 'mongoose';

declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// 이 파일이 모듈로 처리되도록 함
export {};
