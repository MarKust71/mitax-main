/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/terminy',
        destination: 'https://calendar.app.google/s5yvfuHrX3wmULvi9',
        permanent: false,
      },
      {
        source: '/komornik/plan-podzialu-wykonanie',
        destination:
          'https://docs.google.com/spreadsheets/d/1FCiWdK1DWRrvfNfNgz0zlbicjZdvKM4g-HLHWLvn6iA/edit?usp=sharing',
        permanent: false,
      },
      {
        source: '/kumamybiznes',
        destination:
          'https://drive.google.com/drive/folders/1TNcAQqnsfNfkO9BaQ5HKUKwLAfVPOUOk?usp=sharing',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
