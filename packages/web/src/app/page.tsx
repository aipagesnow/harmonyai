export default function Home() {
    return (
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
            <header className="bg-indigo-600 p-8 text-white text-center">
                <h1 className="text-4xl font-bold mb-2">HarmonyAI</h1>
                <p className="text-indigo-100">AI-Powered Conflict Prevention for Slack</p>
            </header>

            <div className="p-8 space-y-8">
                {/* Connection Status Section */}
                <section className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Get Started</h2>
                    <p className="text-gray-600 mb-6">Connect HarmonyAI to your Slack workspace to start monitoring team health.</p>

                    <a
                        href="https://slack.com/oauth/v2/authorize?client_id=YOUR_CLIENT_ID&scope=app_mentions:read,channels:history,chat:write,commands"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.523v-6.312zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52h-2.521zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521 2.527 2.527 0 0 1-2.522-2.521V0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.522 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.52h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.522 2.527 2.527 0 0 1 2.52-2.522h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                        </svg>
                        Add to Slack
                    </a>
                </section>

                <hr className="border-gray-100" />

                {/* Configuration Placeholder */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Alert Settings</h2>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Coming Soon</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-100 opacity-75">
                        <div className="space-y-4 pointer-events-none">
                            <div className="flex items-center justify-between">
                                <label className="text-gray-700">Sentiment Threshold</label>
                                <div className="w-32 h-2 bg-gray-200 rounded">
                                    <div className="w-2/3 h-full bg-indigo-500 rounded"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-gray-700">Admin Alerts</label>
                                <div className="w-10 h-6 bg-indigo-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">Connect your workspace to configure alerts.</p>
                    </div>
                </section>
            </div>
        </div>
    )
}
