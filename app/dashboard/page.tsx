export default function DashboardPage() {
  return (
    <main className="w-screen h-[200vh] overflow-auto">
      {/* <iframe
        title="pb"
        src="https://app.powerbi.com/reportEmbed?reportId=96a3bcbf-9368-4c38-9e60-540667b6b27e&autoAuth=true&ctid=e7572e92-7aee-4713-a3c4-ba64888ad45f&pageNavigationVisible=false"
        frameBorder="0"
        className="w-[80vw] h-full border-none"
        allowFullScreen
      ></iframe> */}
      <iframe
        title="pb"
        src="https://app.powerbi.com/reportEmbed?reportId=96a3bcbf-9368-4c38-9e60-540667b6b27e&autoAuth=true&ctid=e7572e92-7aee-4713-a3c4-ba64888ad45f&pageNavigationVisible=false&pageName=ReportSection1"
        frameBorder="0"
        className="w-[80vw] h-[100vh] border-none"
        allowFullScreen
      ></iframe>

      <iframe
        title="pb"
        src="https://app.powerbi.com/reportEmbed?reportId=96a3bcbf-9368-4c38-9e60-540667b6b27e&autoAuth=true&ctid=e7572e92-7aee-4713-a3c4-ba64888ad45f&pageNavigationVisible=false&pageName=ReportSection2"
        frameBorder="0"
        className="w-[80vw] h-[100vh] border-none"
        allowFullScreen
      ></iframe>
    </main>
  );
}
