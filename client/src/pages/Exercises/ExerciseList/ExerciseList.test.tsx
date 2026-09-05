// @vitest-environment jsdom

import type {
  ChangeEventHandler,
  KeyboardEventHandler,
  PropsWithChildren,
  ReactNode,
} from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExerciseList from "./ExerciseList";

const { getExercisesMock } = vi.hoisted(() => ({
  getExercisesMock: vi.fn(),
}));

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
  useLazyGetExercisesQuery: () => [
    getExercisesMock,
    { data: undefined, isError: false, isLoading: false },
  ],
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
    SoftButton: ({ children, onClick, disabled }: PropsWithChildren<{
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
  default: () => null,
}));

vi.mock("@mui/material", () => {
  const MockContainer = ({ children }: PropsWithChildren) => (
    <div>{children}</div>
  );

  return {
    Alert: MockContainer,
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
    getExercisesMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("sends trimmed transient text, then commits it as an exact tag", async () => {
    const { container } = render(<ExerciseList />);

    await act(() => vi.advanceTimersByTimeAsync(500));
    getExercisesMock.mockClear();

    const tagInput = container.querySelector<HTMLInputElement>("#tags-filter");
    expect(tagInput).not.toBeNull();

    fireEvent.change(tagInput!, { target: { value: "  WaR.*  " } });
    await act(() => vi.advanceTimersByTimeAsync(500));

    expect(getExercisesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tagSearch: "WaR.*",
        tags: [],
        tagMode: "all",
        page: 1,
      }),
    );

    fireEvent.keyDown(tagInput!, { key: "Enter" });
    await act(() => vi.advanceTimersByTimeAsync(500));

    expect(getExercisesMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tagSearch: undefined,
        tags: ["WaR.*"],
        tagMode: "all",
        page: 1,
      }),
    );
  });
});
