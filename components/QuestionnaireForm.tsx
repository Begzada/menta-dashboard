"use client";

import { useState } from "react";
import { Question, Questionnaire } from "@/lib/types";
import { Plus, Trash2, X } from "lucide-react";

interface QuestionnaireFormProps {
  questionnaire?: Questionnaire | null;
  onSubmit: (data: Partial<Questionnaire>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface QuestionEntry {
  key: string;
  question: Partial<Question>;
}

export default function QuestionnaireForm({
  questionnaire,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionnaireFormProps) {
  const [name, setName] = useState(questionnaire?.name || "");
  const [description, setDescription] = useState(
    questionnaire?.description || ""
  );

  // Convert object to array for easier state management
  const [questionEntries, setQuestionEntries] = useState<QuestionEntry[]>(() => {
    if (questionnaire?.questions) {
      return Object.entries(questionnaire.questions).map(([key, question]) => ({
        key,
        question,
      }));
    }
    return [];
  });

  const [error, setError] = useState("");

  const addQuestion = () => {
    const newKey = `question_${Date.now()}`;
    setQuestionEntries([
      ...questionEntries,
      {
        key: newKey,
        question: {
          title: "",
          type: "text",
          required: true,
        },
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newEntries = questionEntries.filter((_, i) => i !== index);
    setQuestionEntries(newEntries);
  };

  const updateQuestionKey = (index: number, newKey: string) => {
    const newEntries = [...questionEntries];
    newEntries[index] = {
      ...newEntries[index],
      key: newKey,
    };
    setQuestionEntries(newEntries);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newEntries = [...questionEntries];
    newEntries[index] = {
      ...newEntries[index],
      question: {
        ...newEntries[index].question,
        [field]: value,
      },
    };
    setQuestionEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (questionEntries.length === 0) {
      setError("Please add at least one question");
      return;
    }

    // Validate questions
    for (let i = 0; i < questionEntries.length; i++) {
      const entry = questionEntries[i];
      const q = entry.question;

      if (!entry.key || entry.key.trim() === "") {
        setError(`Question ${i + 1}: Question ID/key is required`);
        return;
      }

      if (!q.title || q.title.trim() === "") {
        setError(`Question ${i + 1}: Question title is required`);
        return;
      }

      if (
        (q.type === "multiple_choice" || q.type === "checkbox") &&
        (!q.options || q.options.length === 0)
      ) {
        setError(
          `Question ${i + 1}: ${q.type === "checkbox" ? "Checkbox" : "Multiple choice"} questions must have at least one option`
        );
        return;
      }

      if (q.type === "scale" && (!q.scale_min || !q.scale_max)) {
        setError(
          `Question ${i + 1}: Scale questions must have min and max values`
        );
        return;
      }
    }

    try {
      // Convert array back to object for backend
      const questionsObject: Record<string, Question> = {};

      questionEntries.forEach((entry) => {
        const question: any = {
          title: entry.question.title?.trim(),
          type: entry.question.type,
          required: entry.question.required ?? true,
        };

        // Add type-specific fields
        if (entry.question.type === "multiple_choice" || entry.question.type === "checkbox") {
          if (entry.question.options) {
            question.options = entry.question.options;
          }
        }

        if (entry.question.type === "scale") {
          question.scale_min = entry.question.scale_min || 1;
          question.scale_max = entry.question.scale_max || 10;
          if (entry.question.scale_labels) {
            question.scale_labels = entry.question.scale_labels;
          }
        }

        if (entry.question.type === "text" && entry.question.max_length) {
          question.max_length = entry.question.max_length;
        }

        questionsObject[entry.key] = question;
      });

      const payload = {
        name,
        description: description || undefined,
        questions: questionsObject,
        is_active: questionnaire?.is_active ?? false,
      };

      console.log("Submitting questionnaire:", payload);
      console.log("Questions JSON:", JSON.stringify(questionsObject, null, 2));

      await onSubmit(payload);
    } catch (err) {
      console.error("Submit error:", err);
      const errorDetail =
        (err as any).response?.data?.error ||
        (err as any).response?.data?.detail;
      setError(errorDetail || "Failed to save questionnaire");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Questionnaire Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="e.g., Relationship and Communication Assessment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Brief description of this questionnaire"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questionEntries.map((entry, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-md space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">
                  Question {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Key/ID *
                </label>
                <input
                  type="text"
                  required
                  value={entry.key}
                  onChange={(e) => updateQuestionKey(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., relationship_status"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use snake_case, e.g., relationship_status
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={entry.question.title || ""}
                  onChange={(e) =>
                    updateQuestion(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="e.g., What is your current relationship status?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type *
                  </label>
                  <select
                    required
                    value={entry.question.type || "text"}
                    onChange={(e) =>
                      updateQuestion(index, "type", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="text">Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkbox">Checkbox (Multi-select)</option>
                    <option value="scale">Scale</option>
                    <option value="yes_no">Yes/No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required
                  </label>
                  <select
                    value={entry.question.required ? "true" : "false"}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "required",
                        e.target.value === "true"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {entry.question.type === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Length (optional)
                  </label>
                  <input
                    type="number"
                    value={entry.question.max_length || ""}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "max_length",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="e.g., 400"
                  />
                </div>
              )}

              {entry.question.type === "scale" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Value *
                      </label>
                      <input
                        type="number"
                        required
                        value={entry.question.scale_min}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "scale_min",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Value *
                      </label>
                      <input
                        type="number"
                        required
                        value={entry.question.scale_max}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "scale_max",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Scale labels are optional and can be added in advanced mode
                  </p>
                </div>
              )}

              {(entry.question.type === "multiple_choice" ||
                entry.question.type === "checkbox") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options *
                  </label>

                  {/* Display existing options as chips */}
                  {entry.question.options &&
                    entry.question.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {entry.question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            <span>{option}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions =
                                  entry.question.options?.filter(
                                    (_, i) => i !== optIndex
                                  );
                                updateQuestion(index, "options", newOptions);
                              }}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Input to add new option */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type an option and press Enter"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const input = e.currentTarget;
                          const value = input.value.trim();
                          if (value) {
                            const currentOptions =
                              entry.question.options || [];
                            updateQuestion(index, "options", [
                              ...currentOptions,
                              value,
                            ]);
                            input.value = "";
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          const currentOptions = entry.question.options || [];
                          updateQuestion(index, "options", [
                            ...currentOptions,
                            value,
                          ]);
                          input.value = "";
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {(!entry.question.options ||
                    entry.question.options.length === 0) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Add at least one option for this {entry.question.type === "checkbox" ? "checkbox" : "multiple choice"} question
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          {questionEntries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No questions added yet. Click &quot;Add Question&quot; to get
              started.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : questionnaire
            ? "Update Questionnaire"
            : "Create Questionnaire"}
        </button>
      </div>
    </form>
  );
}
