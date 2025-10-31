"use client";

import { useState } from "react";
import { Question, Questionnaire } from "@/lib/types";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";

interface QuestionnaireFormProps {
  questionnaire?: Questionnaire | null;
  onSubmit: (data: Partial<Questionnaire>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function QuestionnaireForm({
  questionnaire,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionnaireFormProps) {
  const [title, setTitle] = useState(questionnaire?.title || "");
  const [description, setDescription] = useState(
    questionnaire?.description || ""
  );
  const [questions, setQuestions] = useState<Partial<Question>[]>(
    questionnaire?.questions || []
  );
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "text",
        order: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(
      newQuestions.map((q, i) => ({
        ...q,
        order: i,
      }))
    );
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    setQuestions(
      newQuestions.map((q, i) => ({
        ...q,
        order: i,
      }))
    );
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (questions.length === 0) {
      setError("Please add at least one question");
      return;
    }

    try {
      await onSubmit({
        title,
        description,
        questions: questions as Question[],
        is_active: questionnaire?.is_active ?? true,
      });
    } catch (err) {
      setError(
        (err as any).response?.data?.detail || "Failed to save questionnaire"
      );
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
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
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
          {questions.map((question, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-md space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">
                  Question {index + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <input
                  type="text"
                  required
                  value={question.question_text || ""}
                  onChange={(e) =>
                    updateQuestion(index, "question_text", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Type *
                </label>
                <select
                  required
                  value={question.question_type || "text"}
                  onChange={(e) =>
                    updateQuestion(index, "question_type", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="text">Text</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="scale">Scale (1-10)</option>
                  <option value="yes_no">Yes/No</option>
                </select>
              </div>

              {question.question_type === "multiple_choice" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={question.options?.join(", ") || ""}
                    onChange={(e) =>
                      updateQuestion(
                        index,
                        "options",
                        e.target.value.split(",").map((o) => o.trim())
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
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
