
import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Languages,
  User,
} from "lucide-react";
import aiRobot from "../../assets/ai-robot.png";

interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
}

interface UserProfile {
  fullName?: string;
  age?: number | string;
  gender?: string;
  state?: string;
  district?: string;
  education?: string;
  studyStatus?: string;
  occupation?: string;
  annualFamilyIncome?: number | string;
  category?: string;
  disability?: boolean;
  minority?: boolean;
  bplCard?: boolean;
  graduationYear?: number | string;
  preferredLanguage?: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface StreamDoneData {
  profile?: UserProfile;
  profileUpdates?: UserProfile;
  nextField?: string | null;
  profileComplete?: boolean;
  preferredLanguage?: string;
  suggestedLanguage?: string;
  reply?: string;
  message?: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const API_URL = `${API_BASE_URL}/api/chat`;

const LANGUAGES = [
  "English",
  "Telugu",
  "Tamil",
  "Hindi",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Odia",
  "Assamese",
  "Konkani",
  "Manipuri",
  "Mizo",
  "Nepali",
  "Urdu",
];

const STATE_LANGUAGES: Record<string, string> = {
  "Andhra Pradesh": "Telugu",
  "Arunachal Pradesh": "English",
  Assam: "Assamese",
  Bihar: "Hindi",
  Chhattisgarh: "Hindi",
  Goa: "Konkani",
  Gujarat: "Gujarati",
  Haryana: "Hindi",
  "Himachal Pradesh": "Hindi",
  Jharkhand: "Hindi",
  Karnataka: "Kannada",
  Kerala: "Malayalam",
  "Madhya Pradesh": "Hindi",
  Maharashtra: "Marathi",
  Manipur: "Manipuri",
  Meghalaya: "English",
  Mizoram: "Mizo",
  Nagaland: "English",
  Odisha: "Odia",
  Punjab: "Punjabi",
  Rajasthan: "Hindi",
  Sikkim: "Nepali",
  "Tamil Nadu": "Tamil",
  Telangana: "Telugu",
  Tripura: "Bengali",
  "Uttar Pradesh": "Hindi",
  Uttarakhand: "Hindi",
  "West Bengal": "Bengali",
  "Andaman and Nicobar Islands": "Hindi",
  Chandigarh: "Punjabi",
  "Dadra and Nagar Haveli and Daman and Diu": "Gujarati",
  Delhi: "Hindi",
  "Jammu and Kashmir": "Urdu",
  Ladakh: "Urdu",
  Lakshadweep: "Malayalam",
  Puducherry: "Tamil",
};

const SPEECH_LOCALES: Record<string, string> = {
  English: "en-IN",
  Telugu: "te-IN",
  Tamil: "ta-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Malayalam: "ml-IN",
  Marathi: "mr-IN",
  Bengali: "bn-IN",
  Gujarati: "gu-IN",
  Punjabi: "pa-IN",
  Odia: "or-IN",
  Assamese: "as-IN",
  Konkani: "kok-IN",
  Manipuri: "mni-IN",
  Mizo: "lus-IN",
  Nepali: "ne-NP",
  Urdu: "ur-IN",
};

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getSuggestedLanguage = (state?: string) => {
  if (!state) return "English";
  return STATE_LANGUAGES[state] || "English";
};

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;

  const speechWindow = window as SpeechWindow;

  const Recognition =
    speechWindow.SpeechRecognition ||
    speechWindow.webkitSpeechRecognition;

  return Recognition ? new Recognition() : null;
};

const AIFloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<UserProfile>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [suggestedLanguage, setSuggestedLanguage] = useState("English");
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [hasSpeechVoice, setHasSpeechVoice] = useState<boolean | null>(
    null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const manuallySelectedLanguage = useRef(false);
  const assistantMessageTextRef = useRef("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const updateAssistantMessage = (
    messageId: string,
    newText: string,
    append = true
  ) => {
    setMessages((previous) =>
      previous.map((message) =>
        message.id === messageId
          ? {
              ...message,
              text: append ? message.text + newText : newText,
            }
          : message
      )
    );
  };

  const findSpeechVoice = (locale: string) => {
    const voices = window.speechSynthesis.getVoices();
    const normalizedLocale = locale.toLowerCase().replace("_", "-");
    const language = normalizedLocale.split("-")[0];

    return (
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().replace("_", "-") ===
          normalizedLocale
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().replace("_", "-").split("-")[0] ===
          language
      )
    );
  };

  const waitForSpeechVoices = () =>
    new Promise<void>((resolve) => {
      if (window.speechSynthesis.getVoices().length > 0) {
        resolve();
        return;
      }

      const handleVoicesChanged = () => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );
        resolve();
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged,
        { once: true }
      );

      window.setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );
        resolve();
      }, 1000);
    });

  const speakText = async (
    text: string,
    language = preferredLanguage
  ) => {
    if (!("speechSynthesis" in window) || !text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const locale = SPEECH_LOCALES[language] || "en-IN";

    utterance.lang = locale;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    await waitForSpeechVoices();
    const selectedVoice = findSpeechVoice(locale);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setHasSpeechVoice(false);
      return;
    }

    const updateVoiceAvailability = () => {
      const locale = SPEECH_LOCALES[preferredLanguage] || "en-IN";
      setHasSpeechVoice(Boolean(findSpeechVoice(locale)));
    };

    updateVoiceAvailability();
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      updateVoiceAvailability
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        updateVoiceAvailability
      );
    };
  }, [preferredLanguage]);

  const handleLanguageChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = event.target.value;

    manuallySelectedLanguage.current = true;
    setPreferredLanguage(selected);

    setProfile((previous) => ({
      ...previous,
      preferredLanguage: selected,
    }));

    window.speechSynthesis?.cancel();
  };

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = getSpeechRecognition();

    if (!recognition) {
      setError(
        "Voice recognition is not supported in this browser. Please use Chrome or type your message."
      );
      return;
    }

    recognition.lang =
      SPEECH_LOCALES[preferredLanguage] || "en-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;

      if (transcript) {
        setInput((previous) =>
          previous ? `${previous} ${transcript}` : transcript
        );
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error !== "aborted") {
        setError(`Voice input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      setError("");
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
      setError("Could not start microphone. Please try again.");
    }
  };

  // --------------------------------------------------
  // SSE EVENT PROCESSOR
  // --------------------------------------------------

  const processSSEFrame = (
    frame: string,
    assistantMessageId: string
  ): StreamDoneData | null => {
    if (!frame.trim()) return null;

    let eventName = "";
    let dataLines: string[] = [];
    let completedData: StreamDoneData | null = null;

    const flushEvent = () => {
      if (dataLines.length === 0) return;

      const rawData = dataLines.join("\n");
      dataLines = [];

      if (!rawData || rawData === "[DONE]") return;

      let payload: Record<string, unknown>;

      try {
        payload = JSON.parse(rawData);
      } catch (parseError) {
        console.error(
          "SchemeSaathi: invalid SSE event data",
          rawData,
          parseError
        );

        setError(
          "The AI server sent an unreadable streaming response. Please try again."
        );

        return;
      }

      // Incrementally append streamed text.
      if (eventName === "token") {
        const token =
          typeof payload.token === "string"
            ? payload.token
            : "";

        if (token) {
          assistantMessageTextRef.current += token;

          updateAssistantMessage(
            assistantMessageId,
            token
          );
        }
      }

      // NEW: Replace the complete assistant message.
      else if (eventName === "replace") {
        const replacementText =
          typeof payload.text === "string"
            ? payload.text
            : "";

        assistantMessageTextRef.current = replacementText;

        updateAssistantMessage(
          assistantMessageId,
          replacementText,
          false
        );
      }

      else if (eventName === "error") {
        setError(
          typeof payload.message === "string"
            ? payload.message
            : "Something went wrong while generating the response."
        );
      }

      else if (eventName === "done") {
        completedData = payload as StreamDoneData;
      }
    };

    for (const line of frame.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        flushEvent();
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      } else if (line.trim() === "") {
        flushEvent();
        eventName = "";
      }
    }

    flushEvent();

    return completedData;
  };

  // --------------------------------------------------
  // SEND MESSAGE
  // --------------------------------------------------

  const handleSendMessage = async (
    event?: FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    setError("");
    setInput("");
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: message,
    };

    const assistantMessageId = createId();

    assistantMessageTextRef.current = "";

    setMessages((previous) => [
      ...previous,
      userMessage,
      {
        id: assistantMessageId,
        role: "model",
        text: "",
      },
    ]);

    let completedData: StreamDoneData | null = null;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          message,
          profile: {
            ...profile,
            preferredLanguage,
          },
          preferredLanguage,
          history: messages.map((item) => ({
            role:
              item.role === "model"
                ? "assistant"
                : "user",
            content: item.text,
          })),
        }),
      });

      if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;

        try {
          const errorData = await response.json();

          errorMessage =
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch {
          // Keep the HTTP error message.
        }

        throw new Error(errorMessage);
      }

      const contentType =
        response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        if (!response.body) {
          throw new Error("Streaming response is not available.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const frames = buffer.split(/\r?\n\r?\n/);

          buffer = frames.pop() || "";

          for (const frame of frames) {
            const result = processSSEFrame(
              frame,
              assistantMessageId
            );

            if (result) {
              completedData = result;
            }
          }
        }

        buffer += decoder.decode();

        if (buffer.trim()) {
          const result = processSSEFrame(
            buffer,
            assistantMessageId
          );

          if (result) {
            completedData = result;
          }
        }
      }

      else if (contentType.includes("application/json")) {
        const data = await response.json();

        if (data.success === false) {
          throw new Error(
            data.message || "Unable to process your request."
          );
        }

        const finalReply =
          typeof data.reply === "string"
            ? data.reply
            : "";

        assistantMessageTextRef.current = finalReply;

        updateAssistantMessage(
          assistantMessageId,
          finalReply,
          false
        );

        completedData = data as StreamDoneData;
      }

      else {
        throw new Error(
          `Unexpected response format: ${contentType || "unknown"}`
        );
      }

      if (
        !assistantMessageTextRef.current.trim() &&
        !completedData
      ) {
        throw new Error(
          "The AI server returned an empty response. Please try again."
        );
      }

      // Update profile after receiving the done event.
      if (completedData) {
        const updatedProfile = {
          ...profile,
          ...(completedData.profileUpdates || {}),
          ...(completedData.profile || {}),
        };

        setProfile(updatedProfile);

        const stateName = String(
          updatedProfile.state || ""
        );

        if (stateName && updatedProfile.district) {
          const suggested =
            completedData.suggestedLanguage ||
            getSuggestedLanguage(stateName);

          setSuggestedLanguage(suggested);

          if (!manuallySelectedLanguage.current) {
            setPreferredLanguage(suggested);

            setProfile((previous) => ({
              ...previous,
              ...updatedProfile,
              preferredLanguage: suggested,
            }));
          }
        }

        if (completedData.preferredLanguage) {
          setPreferredLanguage(
            completedData.preferredLanguage
          );
        }
      }

      // Speak only after the complete response is received.
      if (
        autoSpeak &&
        assistantMessageTextRef.current.trim()
      ) {
        speakText(
          assistantMessageTextRef.current,
          completedData?.preferredLanguage || preferredLanguage
        );
      }
    } catch (err) {
      const messageText =
        err instanceof Error
          ? err.message
          : "Unable to connect to SchemeSaathi.";

      setError(messageText);

      updateAssistantMessage(
        assistantMessageId,
        "Sorry, I couldn't process that request. Please try again.",
        false
      );

      assistantMessageTextRef.current =
        "Sorry, I couldn't process that request. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  const hasLocation =
    Boolean(profile.state) && Boolean(profile.district);

  return (
    <>
      {/* Floating assistant button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-900/30"
        aria-label="Open SchemeSaathi AI Assistant"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <img
            src={aiRobot}
            alt="SchemeSaathi AI"
            className="h-full w-full object-cover"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(650px,calc(100dvh-120px))] w-[min(410px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-green-100 bg-white shadow-2xl shadow-green-950/20"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white">
                  <img
                    src={aiRobot}
                    alt="AI Robot"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="flex items-center gap-1.5 font-bold">
                    SchemeSaathi AI
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </h3>

                  <p className="text-xs text-green-100">
                    Your Government Scheme Assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  recognitionRef.current?.abort();
                  setIsListening(false);
                  window.speechSynthesis?.cancel();
                }}
                className="rounded-full p-2 transition hover:bg-white/20"
                aria-label="Close assistant"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language selection */}
            <div className="border-b border-green-100 bg-green-50/80 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-900">
                  <Languages className="h-4 w-4" />
                  <span>Conversation language</span>
                </div>

                <select
                  value={preferredLanguage}
                  onChange={handleLanguageChange}
                  className="max-w-[145px] rounded-lg border border-green-200 bg-white px-2 py-1.5 text-xs font-medium text-green-900 outline-none focus:border-green-500"
                  aria-label="Choose conversation language"
                >
                  {LANGUAGES.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
              </div>

              {hasLocation && (
                <p className="mt-1.5 text-[11px] text-green-700">
                  Suggested for {profile.state}: {suggestedLanguage}
                </p>
              )}

              {hasSpeechVoice === false && (
                <p className="mt-1.5 text-[11px] text-amber-700">
                  No {preferredLanguage} voice is installed. AI voice may
                  use a fallback voice.
                </p>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-green-50/50 to-white px-4 py-4">
              {messages.length === 0 && (
                <div className="flex min-h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-green-100 bg-white shadow-md">
                    <img
                      src={aiRobot}
                      alt="SchemeSaathi AI"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h4 className="text-lg font-bold text-green-900">
                    Vanakkam! Welcome to SchemeSaathi
                  </h4>

                  <p className="mt-2 max-w-[270px] text-sm leading-6 text-gray-600">
                    I can help you discover government schemes
                    based on your profile and eligibility.
                  </p>

                  <div className="mt-4 rounded-xl border border-green-100 bg-white px-4 py-3 text-left text-xs leading-5 text-gray-600 shadow-sm">
                    <p className="font-semibold text-green-800">
                      Let's get started!
                    </p>

                    <p>
                      Tell me your name, or ask me about
                      government schemes.
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {message.role === "model" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100">
                      <img
                        src={aiRobot}
                        alt="AI"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "rounded-br-sm bg-green-600 text-white"
                        : "rounded-bl-sm border border-green-100 bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {message.text ||
                      (isLoading &&
                      message.role === "model" ? (
                        <span className="inline-flex items-center gap-2 text-green-700">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Thinking...
                        </span>
                      ) : null)}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading &&
                messages[messages.length - 1]?.role === "model" &&
                messages[messages.length - 1]?.text && (
                  <div className="pl-10 text-xs text-green-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                      Generating response...
                    </span>
                  </div>
                )}

              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <div className="mx-3 mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-2 font-semibold underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="border-t border-green-100 bg-white px-3 py-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] text-gray-500">
                  {isListening
                    ? "Listening... Speak now"
                    : "Ask in your preferred language"}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setAutoSpeak((previous) => !previous);
                    window.speechSynthesis?.cancel();
                  }}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${
                    autoSpeak
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                  title={
                    autoSpeak
                      ? "Turn off AI voice"
                      : "Turn on AI voice"
                  }
                >
                  {autoSpeak ? (
                    <Volume2 className="h-3.5 w-3.5" />
                  ) : (
                    <VolumeX className="h-3.5 w-3.5" />
                  )}

                  AI Voice
                </button>
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                    isListening
                      ? "animate-pulse bg-red-100 text-red-600"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  } disabled:opacity-50`}
                  aria-label={
                    isListening
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                  title="Voice input"
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </button>

                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="min-w-0 flex-1 rounded-full border border-green-200 bg-green-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-500 focus:bg-white disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-md transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>

              <p className="mt-2 text-center text-[10px] text-gray-400">
                SchemeSaathi AI may make mistakes. Verify scheme
                details with official government sources.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFloatingAssistant;
