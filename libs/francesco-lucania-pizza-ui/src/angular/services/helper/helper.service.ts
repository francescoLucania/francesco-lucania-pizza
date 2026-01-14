import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { UntypedFormGroup } from '@angular/forms';
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
  ) {
    return new Event(eventType, { bubbles, cancelable });
  }

  public static isString(something: any) {
    return typeof something === 'string' || something instanceof String;
  }

  public static isObject(something: any) {
    if (something === null || something === undefined) {
      return false;
    }
    return typeof something === 'function' || typeof something === 'object';
  }

  public static isArray(something: any) {
    return Array.isArray(something);
  }

  public static isFunction(something: any) {
    return typeof something === 'function' || something instanceof Function;
  }

  public static isIterable(something: any, strict?: boolean) {
    if (something === null || something === undefined) {
      return false;
    }
    if (strict) {
      return typeof something[Symbol.iterator] === 'function';
    } else {
      return (
        typeof something[Symbol.iterator] === 'function' ||
        HelperService.isObject(something)
      );
    }
  }

  public static isEmpty(something: any) {
    if (!HelperService.isIterable(something)) {
      return false;
    }
    if (HelperService.isIterable(something, true)) {
      for (const i of Object.keys(something)) {
        return false;
      }
    }
    return true;
  }

  public static keys(something: any) {
    if (!HelperService.isObject(something)) {
      return [];
    }
    return Object.keys(something);
  }

  // простое глубокое копирование, подходит для json-образных структур где конструкторы/типы объектов не имеют значения
  public static deepCopy(obj: any) {
    let newObj = obj; // все простые типы копируются как есть
    if (obj && typeof obj === 'object') {
      if (obj instanceof Date) {
        return new Date(obj.getTime()); // даты клонируем, т.к. они mutable
      }
      newObj =
        Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
      for (const i of Object.keys(obj)) {
        newObj[i] = this.deepCopy(obj[i]);
      }
    }
    return newObj;
  }

  public static copyArrayToArray(source: any[], dest: any[]): void {
    if (!dest) {
      return;
    }
    const sourceX = source || [];
    const originalLength = dest.length;
    sourceX.forEach((item: any, index: number) => {
      dest[index] = source[index];
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
  public static htmlToText(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body ? doc.body.textContent : '';
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
  ) {
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
    let matchEnd = (value || '').length;
    if (mask && value) {
      for (let i = mask.length; i--; i >= 0) {
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
    mask: any = null,
    startPosition?: number
  ) {
    if (
      !inputElement ||
      !(inputElement.type === 'text' || inputElement.type === 'password')
    ) {
      return;
    }
    const lastCharacterPosition = HelperService.findMatchEnd(
      inputElement.value,
      mask
    );
    const indexOfCaret =
      startPosition && startPosition > lastCharacterPosition
        ? startPosition
        : lastCharacterPosition;
    inputElement.setSelectionRange(indexOfCaret, indexOfCaret);
  }

  public static markFormTouched(form: UntypedFormGroup) {
    const controls = form.controls;
    for (const controlName of Object.keys(controls)) {
      controls[controlName].markAsTouched({ onlySelf: false });
    }
  }

  // Проверка на идентичность объектов.
  public static deepEqual(object1: any, object2: any): boolean {
    if (object1 == null || object2 == null) {
      return object2 === object1;
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
