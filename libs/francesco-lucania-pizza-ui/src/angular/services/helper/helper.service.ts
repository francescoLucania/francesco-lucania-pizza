import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  constructor(
    private router: Router,
    private titleService: Title,
    private meta: Meta
  ) {}

  public static createEvent(
    eventType: string,
    bubbles: boolean,
    cancelable: boolean
  ): Event {
    return new Event(eventType, { bubbles, cancelable });
  }

  public static isString(something: unknown): something is string {
    return typeof something === 'string' || something instanceof String;
  }

  public static isObject(something: unknown): something is Record<string, unknown> {
    if (something === null || something === undefined) {
      return false;
    }
    // Exclude functions and arrays from object check
    return typeof something === 'object' && !Array.isArray(something);
  }

  public static isArray(something: unknown): something is unknown[] {
    return Array.isArray(something);
  }

  public static isFunction(something: unknown): something is (...args: unknown[]) => unknown {
    return typeof something === 'function';
  }

  public static isIterable(something: unknown, strict?: boolean): boolean {
    if (something === null || something === undefined) {
      return false;
    }
    if (strict) {
      return typeof (something as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function';
    } else {
      return (
        typeof (something as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function' ||
        HelperService.isObject(something)
      );
    }
  }

  public static isEmpty(something: unknown): boolean {
    if (!HelperService.isIterable(something)) {
      return false;
    }
    if (HelperService.isIterable(something, true)) {
      const iterable = something as Iterable<unknown> | Record<string, unknown>;
      if (Array.isArray(iterable)) {
        return iterable.length === 0;
      }
      if (HelperService.isObject(iterable)) {
        return Object.keys(iterable).length === 0;
      }
      // For other iterables, check if they have any items
      const iterator = (iterable as Iterable<unknown>)[Symbol.iterator]();
      return iterator.next().done === true;
    }
    return true;
  }

  public static keys(something: unknown): string[] {
    if (!HelperService.isObject(something)) {
      return [];
    }
    return Object.keys(something);
  }

  // простое глубокое копирование, подходит для json-образных структур где конструкторы/типы объектов не имеют значения
  public static deepCopy<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as T;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => HelperService.deepCopy(item)) as T;
    }

    // Handle plain objects
    const newObj = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = HelperService.deepCopy((obj as Record<string, unknown>)[key]);
      }
    }
    return newObj as T;
  }

  public static copyArrayToArray<T>(source: T[], dest: T[]): void {
    if (!dest) {
      return;
    }
    const sourceX = source || [];
    const originalLength = dest.length;
    sourceX.forEach((item: T, index: number) => {
      dest[index] = item;
    });
    if (originalLength > sourceX.length) {
      dest.splice(sourceX.length, originalLength - sourceX.length);
    }
  }

  // преобразует cebab-case, snake-case и обычный текст разделенный пробелами в camelCase
  public static toCamelCase(str: string): string {
    const splitted = str ? str.split(/[\s_\-]+/) : [];
    return splitted
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  }

  // конвертирует хтмл в его текстовое представление, убирает все теги
  public static htmlToText(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body?.textContent ?? '';
  }

  // выбирает склонение существительного в зависимости от количества, массив pluralizeNouns всегда длины 3!
  public static pluralize(quanity: number, pluralizeNouns: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return pluralizeNouns[
      quanity % 100 > 4 && quanity % 100 < 20
        ? 2
        : cases[quanity % 10 < 5 ? quanity % 10 : 5]
    ];
  }

  // определяет затрагивает ли позиция курсора в пользовательском тексте верстку
  public static isTextPosition(
    html: string,
    positionFrom: number,
    positionTo: number
  ): boolean {
    let isText = true;
    for (let i = 0; i < positionTo; i++) {
      if (html[i] === '<') {
        isText = false;
      }
      if (i >= positionFrom && i < positionTo && !isText) {
        return false;
      }
      if (html[i] === '>') {
        isText = true;
      }
    }
    return true;
  }

  public static findMatchEnd(text: string, mask: string): number {
    const value = text || '';
    let matchEnd = value.length;
    if (mask && value) {
      for (let i = mask.length - 1; i >= 0; i--) {
        if (i >= value.length) {
          continue;
        }
        if (mask[i] === value[i]) {
          matchEnd--;
        } else {
          break;
        }
      }
    }
    return matchEnd;
  }

  // ставит курсор ввода на конец текста в текстовом элементе, при этом убирает выделение
  public static resetSelection(
    inputElement: HTMLInputElement,
    mask: string | null = null,
    startPosition?: number
  ): void {
    if (
      !inputElement ||
      !(inputElement.type === 'text' || inputElement.type === 'password')
    ) {
      return;
    }
    const lastCharacterPosition = HelperService.findMatchEnd(
      inputElement.value,
      mask ?? ''
    );
    const indexOfCaret =
      startPosition && startPosition > lastCharacterPosition
        ? startPosition
        : lastCharacterPosition;
    inputElement.setSelectionRange(indexOfCaret, indexOfCaret);
  }

  public static markFormTouched(form: FormGroup): void {
    const controls = form.controls;
    for (const controlName of Object.keys(controls)) {
      controls[controlName].markAsTouched({ onlySelf: false });
    }
  }

  // Проверка на идентичность объектов.
  public static deepEqual(object1: unknown, object2: unknown): boolean {
    if (object1 == null || object2 == null) {
      return object2 === object1;
    }

    if (!HelperService.isObject(object1) || !HelperService.isObject(object2)) {
      return object1 === object2;
    }

    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects =
        HelperService.isObject(val1) && HelperService.isObject(val2);
      if (
        (areObjects && !HelperService.deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  }
}
