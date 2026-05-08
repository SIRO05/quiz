import json
import os

def build():
    source_dir = 'reading_data'
    output_file = 'public/data/task_9.json'
    
    final_output = {
        "description": "mondai kyuu",
        "grade": 1,
        "tasks": []
    }

    # Проходим по папкам юнитов (unit_1, unit_2...)
    units = sorted([d for d in os.listdir(source_dir) if os.path.isdir(os.path.join(source_dir, d))])

    for unit_folder in units:
        unit_path = os.path.join(source_dir, unit_folder)
        
        # 1. Читаем текст доккай
        with open(os.path.join(unit_path, 'passage.txt'), 'r', encoding='utf-8') as f:
            passage_text = f.read()

        # 2. Читаем вопросы
        with open(os.path.join(unit_path, 'questions.json'), 'r', encoding='utf-8') as f:
            questions_list = json.load(f)

        # Добавляем текст доккай в каждый вопрос
        for q in questions_list:
            q["text"] = passage_text

        # 3. Формируем структуру юнита
        unit_data = {
            "unit": int(unit_folder.replace('unit_', '')),
            "questions": questions_list
        }
        
        final_output["tasks"].append(unit_data)

    # Сохраняем финальный JSON
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
    
    print(f"Успех! Файл {output_file} обновлен.")

if __name__ == "__main__":
    build()