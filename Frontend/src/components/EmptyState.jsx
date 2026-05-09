export default function EmptyState({ mode }) {
const content = {
  normal: {
    title: "How can I help you today?",
    subtitle: "Ask anything and get intelligent responses powered by Flash AI.",
    cards: [
      {
        title: "Get Ideas",
        text: "Brainstorm creative solutions and concepts."
      },
      {
        title: "Analyze Data",
        text: "Extract insights and useful information."
      },
      {
        title: "Write Content",
        text: "Generate blogs, posts, summaries, and more."
      },
      {
        title: "Solve Problems",
        text: "Get help with coding, logic, and reasoning."
      }
    ]
  },

  manager: {
    title: "Manage your calendar with AI",
    subtitle: "Create, update, delete and organize events instantly.",
    cards: [
      {
        title: "Create Event",
        text: "Schedule meetings and reminders."
      },
      {
        title: "Get Events",
        text: "See your upcoming schedule."
      },
      {
        title: "Update Event",
        text: "Modify time, title or attendees."
      },
      {
        title: "Delete Event",
        text: "Remove events from your calendar."
      }
    ]
  },

  vault: {
    title: "Upload PDFs and chat with them",
    subtitle: "Ask questions directly from your documents.",
    cards: [
      {
        title: "Upload PDF",
        text: "Add study notes, books or reports."
      },
      {
        title: "Summarize Documents",
        text: "Get quick summaries instantly."
      },
      {
        title: "Ask Questions",
        text: "Extract answers from PDFs."
      },
      {
        title: "Research Faster",
        text: "Find insights from large documents."
      }
    ]
  },

  research: {
    title: "Research anything with AI",
    subtitle: "Search, analyze and explore topics deeply.",
    cards: [
      {
        title: "Web Research",
        text: "Find latest information online."
      },
      {
        title: "Topic Breakdown",
        text: "Understand complex subjects simply."
      },
      {
        title: "Compare Information",
        text: "Analyze multiple sources together."
      },
      {
        title: "Generate Insights",
        text: "Extract useful conclusions quickly."
      }
    ]
  }
}

const current = content[mode] || content.normal;
  return (
  <div className="flex-1 flex flex-col items-center justify-center text-white px-6">

    <h1 className="text-4xl font-bold mb-4">
      {current.title}
    </h1>

    <p className="text-gray-400 text-center max-w-2xl mb-10">
      {current.subtitle}
    </p>

    <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">

      {
        current.cards.map((card, index) => (

          <div
            key={index}
            className="bg-[#141414] border border-purple-500/10 rounded-2xl p-5 hover:border-purple-500/30 transition"
          >

            <h2 className="text-lg font-semibold mb-2">
              {card.title}
            </h2>

            <p className="text-gray-400 text-sm">
              {card.text}
            </p>

          </div>

        ))
      }

    </div>

  </div>
)
}