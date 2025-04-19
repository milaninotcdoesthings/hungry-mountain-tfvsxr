import React, { useState, useEffect, useRef } from "react";

const SimpleAnimationTour = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationIndex, setLocationIndex] = useState(0);
  const [locationData, setLocationData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [activeSection, setActiveSection] = useState("moods");
  const [expandedItem, setExpandedItem] = useState(null);
  const timerRef = useRef(null);

  // Process data from CSV
  useEffect(() => {
    const loadData = async () => {
      try {
        // Using fetch for CodeSandbox instead of window.fs.readFile
        const response = await fetch("/Data_Humanism.csv"); // File is in the public folder
        const fileContent = await response.text();
        const lines = fileContent.split("\n");

        // Parse header
        const header = lines[0].trim().split(","); // Changed from ";" to ","

        // Parse rows
        const parsedData = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          const rowValues = lines[i].split(","); // Changed from ";" to ","
          if (rowValues.length === header.length) {
            const row = {};
            header.forEach((col, index) => {
              row[col] = rowValues[index].trim();
            });
            parsedData.push(row);
          }
        }

        // Process data
        const locations = [...new Set(parsedData.map((row) => row.Tr_rec))]
          .filter(Boolean)
          .sort();

        const processedLocations = locations.map((location) => {
          const locationRows = parsedData.filter(
            (row) => row.Tr_rec === location
          );

          // Find top moods
          const moodCounts = {};
          locationRows.forEach((row) => {
            if (row.Mood) {
              moodCounts[row.Mood] = (moodCounts[row.Mood] || 0) + 1;
            }
          });

          const topMoods = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([mood, count]) => ({ mood, count }));

          // Find top YouTube content
          const contentCounts = {};
          locationRows.forEach((row) => {
            if (row.Yt_Content) {
              contentCounts[row.Yt_Content] =
                (contentCounts[row.Yt_Content] || 0) + 1;
            }
          });

          const topContents = Object.entries(contentCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([content, count]) => ({ content, count }));

          // Find top music genres
          const genreCounts = {};
          locationRows.forEach((row) => {
            if (row.Music_Genre) {
              genreCounts[row.Music_Genre] =
                (genreCounts[row.Music_Genre] || 0) + 1;
            }
          });

          const topGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([genre, count]) => ({ genre, count }));

          // Simple country mapping
          let country = "Unknown";
          if (location === "New York") country = "United States";
          else if (["Barcelona", "Andalusia", "Asturias"].includes(location))
            country = "Spain";
          else if (["Tuscany", "Dolomites", "Versilia"].includes(location))
            country = "Italy";
          else if (["Lisbon", "Algarve"].includes(location))
            country = "Portugal";
          else if (location === "Scotland") country = "Scotland";
          else if (location === "London") country = "United Kingdom";
          else if (location === "Warsaw") country = "Poland";
          else if (location === "Marrakech") country = "Morocco";
          else if (location === "Kyoto") country = "Japan";
          else if (location === "Seoul") country = "South Korea";
          else if (location === "Iceland") country = "Iceland";
          else if (location === "Artic Pole") country = "Arctic";

          return {
            name: location,
            country: country,
            topMoods,
            topContents,
            topGenres,
            dominantMood: topMoods.length > 0 ? topMoods[0].mood : "",
          };
        });

        setData(parsedData);
        setLocationData(processedLocations);
        if (processedLocations.length > 0) {
          setCurrentLocation(processedLocations[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Autoplay effect
  useEffect(() => {
    if (autoplay && !isAnimating && locationData.length > 0) {
      timerRef.current = setTimeout(() => {
        goToNextLocation();
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoplay, locationIndex, isAnimating, locationData]);

  // Navigation functions
  const goToNextLocation = () => {
    if (isAnimating || locationData.length === 0) return;

    const nextIndex = (locationIndex + 1) % locationData.length;
    setIsAnimating(true);

    setTimeout(() => {
      setLocationIndex(nextIndex);
      setCurrentLocation(locationData[nextIndex]);
      setIsAnimating(false);
    }, 1000);
  };

  const goToPrevLocation = () => {
    if (isAnimating || locationData.length === 0) return;

    const prevIndex =
      (locationIndex - 1 + locationData.length) % locationData.length;
    setIsAnimating(true);

    setTimeout(() => {
      setLocationIndex(prevIndex);
      setCurrentLocation(locationData[prevIndex]);
      setIsAnimating(false);
    }, 1000);
  };

  // Helper functions
  const getMoodEmoji = (mood) => {
    const emojis = {
      Sad: "😢",
      Motivated: "💪",
      Chill: "😌",
      Studying: "📚",
      Reflexive: "🤔",
      Anxious: "😰",
      Overthinking: "🧠",
      Nostalgia: "🕰️",
      Focused: "🎯",
      Euphoria: "🥳",
      Angry: "😡",
    };
    return emojis[mood] || "🙂";
  };

  const getContentEmoji = (content) => {
    const emojis = {
      Fun: "🎮",
      Podcast: "🎙️",
      Sport: "🏀",
      Music: "🎵",
      Travel: "✈️",
      Work: "💼",
      Doc: "📄",
      Comedy: "😂",
      Curiosity: "🔍",
    };
    return emojis[content] || "📺";
  };

  const getGenreEmoji = (genre) => {
    const emojis = {
      "Lo-Fi": "🎧",
      "Polish Rap": "🇵🇱",
      "Us Rap": "🇺🇸",
      EDM: "🎛️",
      Pop: "🎤",
      "Italian Rap": "🇮🇹",
      PNL: "🇫🇷",
      "Uk Drill": "🇬🇧",
      "R & B": "🎵",
      Techno: "🔊",
      Afrobeat: "🌍",
      Soul: "❤️",
      Trap: "🔥",
      Phonk: "👻",
    };
    return emojis[genre] || "🎸";
  };

  const getMoodColor = (mood) => {
    const colors = {
      Sad: "bg-gray-200",
      Motivated: "bg-blue-200",
      Chill: "bg-violet-200",
      Studying: "bg-slate-200",
      Reflexive: "bg-green-200",
      Anxious: "bg-red-100",
      Overthinking: "bg-purple-200",
      Nostalgia: "bg-yellow-200",
      Focused: "bg-emerald-200",
      Euphoria: "bg-red-200",
      Angry: "bg-rose-200",
    };
    return colors[mood] || "bg-blue-100";
  };

  const getLocationIcon = (location) => {
    const icons = {
      Andalusia: "💃",
      Asturias: "🌊",
      Lisbon: "🚋",
      Dolomites: "🏔️",
      Tuscany: "🖼️",
      Barcelona: "🏛️",
      Kyoto: "🏯",
      "New York": "🗽",
      Scotland: "🥃",
      London: "☕",
      Algarve: "🏖️",
      Versilia: "🏖️",
      Warsaw: "🥟",
      Marrakech: "🍵",
      Seoul: "🍲",
      Iceland: "♨️",
      "Artic Pole": "🧊",
    };
    return icons[location] || "🏮";
  };

  const getCountryFlag = (country) => {
    const flags = {
      "United States": "🇺🇸",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Portugal: "🇵🇹",
      Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "United Kingdom": "🇬🇧",
      Poland: "🇵🇱",
      Morocco: "🇲🇦",
      Japan: "🇯🇵",
      "South Korea": "🇰🇷",
      Iceland: "🇮🇸",
      Arctic: "❄️",
    };
    return flags[country] || "🌍";
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-blue-50 text-blue-500">
        Loading...
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-4">
        Cultural Data Journey
      </h1>

      {/* Controls */}
      <div className="bg-white p-3 rounded-lg shadow-md mb-4 flex flex-wrap justify-between items-center">
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
            onClick={goToPrevLocation}
            disabled={isAnimating}
          >
            Previous
          </button>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded-md disabled:opacity-50"
            onClick={goToNextLocation}
            disabled={isAnimating}
          >
            Next
          </button>
        </div>

        <div>
          <button
            className={`px-3 py-1 rounded-md text-white ${
              autoplay ? "bg-red-500" : "bg-green-500"
            }`}
            onClick={() => setAutoplay(!autoplay)}
          >
            {autoplay ? "Stop Tour" : "Start Tour"}
          </button>
        </div>
      </div>

      {/* Main display */}
      {currentLocation && (
        <div
          className={`relative overflow-hidden transition-all duration-500 ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
        >
          {/* Location header */}
          <div className="bg-white p-4 rounded-t-lg shadow-md flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-3xl mr-2">
                {getCountryFlag(currentLocation.country)}
              </span>
              <div>
                <h2 className="text-xl font-bold">{currentLocation.name}</h2>
                <p className="text-gray-600">{currentLocation.country}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-lg mr-1">
                {getMoodEmoji(currentLocation.dominantMood)}
              </span>
              <span>{currentLocation.dominantMood}</span>
            </div>
          </div>

          {/* Icon display with mood background */}
          <div
            className={`flex flex-col items-center justify-center p-6 h-64 ${getMoodColor(
              currentLocation.dominantMood
            )}`}
          >
            <div className="text-9xl mb-4">
              {getLocationIcon(currentLocation.name)}
            </div>

            {/* Airplane animation */}
            {isAnimating && (
              <div className="absolute inset-0">
                <div
                  className="absolute text-4xl animate-bounce"
                  style={{ top: "40%", left: "50%" }}
                >
                  ✈️
                </div>
              </div>
            )}
          </div>

          {/* Interactive Data Sections */}
          <div className="bg-white p-4 rounded-b-lg shadow-md">
            {/* Section navigation tabs */}
            <div className="flex border-b mb-4">
              <button
                className={`px-4 py-2 font-medium ${
                  activeSection === "moods"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveSection("moods")}
              >
                Moods 😌
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeSection === "content"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveSection("content")}
              >
                YouTube 🎬
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeSection === "music"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveSection("music")}
              >
                Music 🎵
              </button>
            </div>

            {/* Mood section */}
            {activeSection === "moods" && (
              <div className="transition-opacity duration-300 ease-in-out">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  Top Moods:
                </h3>
                <div className="space-y-3">
                  {currentLocation.topMoods.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-blue-50 rounded-lg p-3 transition-all duration-300 ease-in-out ${
                        expandedItem === `mood-${index}`
                          ? "shadow-md"
                          : "shadow-sm hover:shadow-md cursor-pointer"
                      }`}
                      onClick={() =>
                        setExpandedItem(
                          expandedItem === `mood-${index}`
                            ? null
                            : `mood-${index}`
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getMoodEmoji(item.mood)}
                          </span>
                          <span className="font-medium">{item.mood}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                            {item.count}
                          </span>
                          <svg
                            className={`w-5 h-5 text-blue-500 transform transition-transform ${
                              expandedItem === `mood-${index}`
                                ? "rotate-180"
                                : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedItem === `mood-${index}` && (
                        <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-blue-100">
                          <p>
                            People in {currentLocation.name} often feel{" "}
                            <b>{item.mood.toLowerCase()}</b> when:
                          </p>
                          <ul className="list-disc pl-5 mt-2">
                            <li>
                              Listening to{" "}
                              {currentLocation.topGenres[0]?.genre || "music"}
                            </li>
                            <li>
                              Watching{" "}
                              {currentLocation.topContents[0]?.content ||
                                "content"}{" "}
                              on YouTube
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube content section */}
            {activeSection === "content" && (
              <div className="transition-opacity duration-300 ease-in-out">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  Top YouTube Content:
                </h3>
                <div className="space-y-3">
                  {currentLocation.topContents.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-green-50 rounded-lg p-3 transition-all duration-300 ease-in-out ${
                        expandedItem === `content-${index}`
                          ? "shadow-md"
                          : "shadow-sm hover:shadow-md cursor-pointer"
                      }`}
                      onClick={() =>
                        setExpandedItem(
                          expandedItem === `content-${index}`
                            ? null
                            : `content-${index}`
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getContentEmoji(item.content)}
                          </span>
                          <span className="font-medium">{item.content}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                            {item.count}
                          </span>
                          <svg
                            className={`w-5 h-5 text-green-500 transform transition-transform ${
                              expandedItem === `content-${index}`
                                ? "rotate-180"
                                : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedItem === `content-${index}` && (
                        <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-green-100">
                          <p>
                            In {currentLocation.name}, <b>{item.content}</b>{" "}
                            content is popular:
                          </p>
                          <ul className="list-disc pl-5 mt-2">
                            <li>
                              Often watched by people feeling{" "}
                              {currentLocation.topMoods[0]?.mood ||
                                "various moods"}
                            </li>
                            <li>
                              Frequently paired with{" "}
                              {currentLocation.topGenres[0]?.genre ||
                                "various music genres"}
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Music genre section */}
            {activeSection === "music" && (
              <div className="transition-opacity duration-300 ease-in-out">
                <h3 className="text-lg font-semibold mb-3 text-amber-800">
                  Top Music Genres:
                </h3>
                <div className="space-y-3">
                  {currentLocation.topGenres.map((item, index) => (
                    <div
                      key={index}
                      className={`bg-amber-50 rounded-lg p-3 transition-all duration-300 ease-in-out ${
                        expandedItem === `genre-${index}`
                          ? "shadow-md"
                          : "shadow-sm hover:shadow-md cursor-pointer"
                      }`}
                      onClick={() =>
                        setExpandedItem(
                          expandedItem === `genre-${index}`
                            ? null
                            : `genre-${index}`
                        )
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getGenreEmoji(item.genre)}
                          </span>
                          <span className="font-medium">{item.genre}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-amber-200 text-amber-800 px-2 py-1 rounded-full text-sm font-medium mr-2">
                            {item.count}
                          </span>
                          <svg
                            className={`w-5 h-5 text-amber-500 transform transition-transform ${
                              expandedItem === `genre-${index}`
                                ? "rotate-180"
                                : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Expanded content */}
                      {expandedItem === `genre-${index}` && (
                        <div className="mt-3 text-sm text-gray-600 bg-white p-3 rounded-lg border border-amber-100">
                          <p>
                            <b>{item.genre}</b> is popular in{" "}
                            {currentLocation.name}:
                          </p>
                          <ul className="list-disc pl-5 mt-2">
                            <li>
                              Often listened to while feeling{" "}
                              {currentLocation.topMoods[0]?.mood ||
                                "various moods"}
                            </li>
                            <li>
                              Frequently paired with{" "}
                              {currentLocation.topContents[0]?.content ||
                                "various content"}{" "}
                              on YouTube
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAnimationTour;
