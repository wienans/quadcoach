import { TacticPage } from "../../../api/quadcoachApi/domain";
import { FabricObjectData } from "./types";

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class TacticPageValidator {
  static validate(page: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (!page || typeof page !== "object") {
      errors.push(new ValidationError("TacticPage must be an object"));
      return { isValid: false, errors };
    }

    const tacticPage = page as Partial<TacticPage>;

    // Validate background image
    if (tacticPage.backgroundImage) {
      if (
        typeof tacticPage.backgroundImage !== "object" ||
        !tacticPage.backgroundImage.src
      ) {
        errors.push(
          new ValidationError(
            "backgroundImage must have a valid src property",
            "backgroundImage",
          ),
        );
      }
    }

    // Validate objects array
    if (tacticPage.objects) {
      if (!Array.isArray(tacticPage.objects)) {
        errors.push(new ValidationError("objects must be an array", "objects"));
      } else {
        tacticPage.objects.forEach((obj, index) => {
          const objErrors = this.validateObject(obj, `objects[${index}]`);
          errors.push(...objErrors);
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateObject(obj: unknown, path: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!obj || typeof obj !== "object") {
      errors.push(new ValidationError("Object must be a valid object", path));
      return errors;
    }

    const fabricObj = obj as Partial<FabricObjectData>;

    // Validate required type field
    if (!fabricObj.type || typeof fabricObj.type !== "string") {
      errors.push(
        new ValidationError("Object must have a valid type", `${path}.type`),
      );
    }

    // Validate coordinates if present
    if (
      fabricObj.left !== undefined &&
      (typeof fabricObj.left !== "number" || !isFinite(fabricObj.left))
    ) {
      errors.push(
        new ValidationError(
          "left coordinate must be a finite number",
          `${path}.left`,
        ),
      );
    }

    if (
      fabricObj.top !== undefined &&
      (typeof fabricObj.top !== "number" || !isFinite(fabricObj.top))
    ) {
      errors.push(
        new ValidationError(
          "top coordinate must be a finite number",
          `${path}.top`,
        ),
      );
    }

    // Validate specific object types
    switch (fabricObj.type) {
      case "text":
        if (
          fabricObj.text !== undefined &&
          typeof fabricObj.text !== "string"
        ) {
          errors.push(
            new ValidationError(
              "text property must be a string",
              `${path}.text`,
            ),
          );
        }
        break;
      case "path":
        if (
          fabricObj.path !== undefined &&
          typeof fabricObj.path !== "string" &&
          !Array.isArray(fabricObj.path)
        ) {
          errors.push(
            new ValidationError(
              "path property must be a string or array",
              `${path}.path`,
            ),
          );
        }
        break;
      case "group":
        if (fabricObj.objects) {
          if (!Array.isArray(fabricObj.objects)) {
            errors.push(
              new ValidationError(
                "group objects must be an array",
                `${path}.objects`,
              ),
            );
          } else {
            fabricObj.objects.forEach((groupObj, index) => {
              const groupObjErrors = this.validateObject(
                groupObj,
                `${path}.objects[${index}]`,
              );
              errors.push(...groupObjErrors);
            });
          }
        }
        break;
    }

    return errors;
  }

  static sanitize(page: TacticPage): TacticPage {
    const sanitized = { ...page };

    // Sanitize objects array
    if (sanitized.objects) {
      sanitized.objects = sanitized.objects
        .map((obj) => this.sanitizeObject(obj))
        .filter((obj): obj is FabricObjectData => obj !== null && !!obj.uuid);
    }

    return sanitized;
  }

  private static sanitizeObject(
    obj: FabricObjectData,
  ): FabricObjectData | null {
    if (!obj || !obj.type) {
      return null;
    }

    const sanitized: FabricObjectData = {
      ...obj,
      type: obj.type,
    };

    // Ensure coordinates are valid numbers
    if (typeof sanitized.left === "number" && isFinite(sanitized.left)) {
      sanitized.left = Number(sanitized.left);
    }
    if (typeof sanitized.top === "number" && isFinite(sanitized.top)) {
      sanitized.top = Number(sanitized.top);
    }

    // Sanitize group objects recursively
    if (sanitized.type === "group" && sanitized.objects) {
      sanitized.objects = sanitized.objects
        .map((groupObj) => this.sanitizeObject(groupObj))
        .filter((obj) => obj !== null) as FabricObjectData[];
    }

    return sanitized;
  }
}
