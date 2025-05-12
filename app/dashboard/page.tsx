export default function DashboardPage() {
    return (
      <main className="max-w-[100vw] mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Dashboard</h1>
        <iframe
          title="abc"
          width="1440"
          height="800"
          src="https://app.powerbi.com/reportEmbed?reportId=b275b614-a1e0-4482-bc15-5a94bb8b03a1&autoAuth=true&ctid=e7572e92-7aee-4713-a3c4-ba64888ad45f&pageNavigationVisible=false"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </main>
    );
  }
  