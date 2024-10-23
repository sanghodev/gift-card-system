module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Next.js app 경로 설정
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',  // 블루 톤의 주요 색상
        secondary: '#F97316', // 오렌지 색상
        accent: '#10B981', // 밝은 그린 색상
        background: '#F3F4F6', // 전체 배경에 사용할 그레이 톤
        cardBackground: '#FFFFFF', // 카드 배경용 화이트
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // 전체적으로 깔끔한 sans-serif 폰트 사용
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.1)', // 카드 요소에 적합한 그림자
      },
    },
  },
  plugins: [],
};
