// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import type {
  ChangeEventHandler,
  KeyboardEventHandler,
  PropsWithChildren,
  ReactNode,
} from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExerciseSummary } from "../../../api/quadcoachApi/domain";
import type { GetExercisesResponse } from "../../exerciseApi";

import ExerciseList from "./ExerciseList";

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function exercise(id: string, name: string): ExerciseSummary {
  return {
    _id: id,
    name,
    tags: [],
    materials: [],
    durationMinutes: null,
    persons: null,
    beaters: null,
    chasers: null,
    relatedTo: [],
  };
}

function page(items: ExerciseSummary[]): GetExercisesResponse {
  return {
    items,
    pagination: {
      page: 1,
      limit: 50,
      total: items.length,
      pages: 1,
    },
  };
}

const { getExercisesMock } = vi.hoisted(() => ({
  getExercisesMock: vi.fn(),
}));

const requests: Array<{
  deferred: Deferred<GetExercisesResponse>;
  abort: ReturnType<typeof vi.fn>;
}> = [];

vi.mock("./translations", () => ({}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../../../store/hooks", () => ({
  useAuth: () => ({ id: "user-1", name: "Coach", status: null }),
}));

vi.mock("../../exerciseApi", () => ({
  useLazyGetExercisesQuery: () => [getExercisesMock],
  useAddExerciseMutation: () => [
    vi.fn(() => ({ unwrap: vi.fn() })),
    { isLoading: false },
  ],
}));

vi.mock("../../../components", () => {
  const MockContainer = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );

  return {
    SoftBox: MockContainer,
    SoftButton: ({
      children,
      onClick,
      disabled,
    }: PropsWithChildren<{
      onClick?: () => void;
      disabled?: boolean;
    }>) => (
      <button type="button" onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    SoftInput: ({
      id,
      placeholder,
      value,
      onChange,
      onKeyDown,
      disabled,
      type,
    }: {
      id?: string;
      placeholder?: string;
      value?: string;
      onChange?: ChangeEventHandler<HTMLInputElement>;
      onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
      disabled?: boolean;
      type?: string;
    }) => (
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        type={type}
      />
    ),
    SoftTypography: MockContainer,
  };
});

vi.mock("../../../components/LayoutContainers", () => ({
  DashboardLayout: ({
    header,
    children,
  }: {
    header: (scrollTrigger: boolean) => ReactNode;
    children: (scrollTrigger: boolean) => ReactNode;
  }) => (
    <div>
      {header(false)}
      {children(false)}
    </div>
  ),
}));

vi.mock("../../../components/Footer", () => ({
  default: () => null,
}));

vi.mock("./cardView/ExercisesCardView", () => ({
  default: ({
    exercises,
    isExercisesLoading,
  }: {
    exercises: ExerciseSummary[];
    isExercisesLoading: boolean;
  }) => (
    <div data-testid="exercise-results">
      {isExercisesLoading
        ? "loading"
        : exercises.map((item) => item.name).join(",") || "empty"}
    </div>
  ),
}));

vi.mock("@mui/material", () => {
  const MockContainer = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );

  return {
    Alert: ({ children }: PropsWithChildren) => <div role="alert">{children}</div>,
    Button: MockContainer,
    Card: MockContainer,
    CardHeader: ({ title, action }: { title: ReactNode; action: ReactNode }) => (
      <div>
        {title}
        {action}
      </div>
    ),
    Chip: ({ label }: { label: ReactNode }) => <span>{label}</span>,
    CircularProgress: () => null,
    Dialog: MockContainer,
    DialogActions: MockContainer,
    DialogContent: MockContainer,
    DialogTitle: MockContainer,
    FormControl: MockContainer,
    Grid: MockContainer,
    InputAdornment: MockContainer,
    InputLabel: MockContainer,
    MenuItem: MockContainer,
    Popover: MockContainer,
    Select: MockContainer,
    Slider: () => null,
    ToggleButton: MockContainer,
    useMediaQuery: () => true,
  };
});

vi.mock("@mui/icons-material/FilterAlt", () => ({ default: () => null }));
vi.mock("@mui/icons-material/KeyboardReturn", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Add", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Close", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Clear", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Sort", () => ({ default: () => null }));

describe("ExerciseList live tag filtering", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    requests.length = 0;
    getExercisesMock.mockReset();
    getExercisesMock.mockImplementation(() => {
      const request = {
        deferred: deferred<GetExercisesResponse>(),
        abort: vi.fn(),
      };
      requests.push(request);
      return {
        abort: request.abort,
        unwrap: () => request.deferred.promise,
      };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("wires typed, committed, cleared, loading, and generation-safe states", async () => {
    const { container } = render(<ExerciseList />);
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("loading");

    act(() => vi.advanceTimersByTime(500));
    await act(async () => requests[0].deferred.resolve(page([])));
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("empty");

    const tagInput = container.querySelector<HTMLInputElement>("#tags-filter");
    expect(tagInput).not.toBeNull();
    fireEvent.change(tagInput!, { target: { value: "  fen  " } });
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("loading");
    act(() => vi.advanceTimersByTime(499));
    expect(getExercisesMock).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(1));
    expect(getExercisesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tagSearch: "fen", tags: [], page: 1 }),
    );
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("loading");

    await act(async () =>
      requests[1].deferred.resolve(page([exercise("1", "Defense drill")]))
    );
    expect(screen.getByTestId("exercise-results")).toHaveTextContent(
      "Defense drill",
    );

    fireEvent.keyDown(tagInput!, { key: "Enter" });
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("loading");
    act(() => vi.advanceTimersByTime(500));
    expect(getExercisesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tagSearch: undefined,
        tags: ["fen"],
        tagMode: "all",
        page: 1,
      }),
    );
    await act(async () =>
      requests[2].deferred.resolve(page([exercise("2", "Exact fen")]))
    );

    fireEvent.change(tagInput!, { target: { value: "old" } });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.change(tagInput!, { target: { value: "" } });
    expect(requests[3].abort).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(500));
    expect(getExercisesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ tagSearch: undefined, tags: ["fen"] }),
    );

    await act(async () => requests[3].deferred.reject(new Error("obsolete")));
    expect(screen.getByTestId("exercise-results")).toHaveTextContent("loading");
    await act(async () => requests[4].deferred.reject(new Error("active")));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "ExerciseList:errorLoadingExercises",
    );
  });
});
