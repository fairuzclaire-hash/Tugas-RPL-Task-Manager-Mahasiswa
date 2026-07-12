import eel
import sqlite3
from datetime import datetime

eel.init('.')

def init_db():
    conn = sqlite3.connect('task_manager.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT NOT NULL,
            course_name TEXT NOT NULL,
            deadline TEXT NOT NULL,
            status TEXT NOT NULL,
            priority TEXT NOT NULL,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_deadline ON tasks(deadline)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_status ON tasks(status)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_course ON tasks(course_name)')
    
    conn.commit()
    
    cursor.execute('SELECT COUNT(*) FROM tasks')
    if cursor.fetchone()[0] == 0:
        sample_data = [
            ('Tugas UTS Pemrograman Web', 'Pemrograman Web', '2026-07-05 23:59:00', 'belum dikerjakan', 'tinggi', 'Buat website task manager dengan fitur CRUD'),
            ('Laporan Praktikum Basis Data', 'Basis Data', '2026-07-02 14:00:00', 'sedang dikerjakan', 'tinggi', 'Sudah 50% selesai'),
            ('Resume Jurnal Machine Learning', 'Kecerdasan Buatan', '2026-07-10 23:59:00', 'belum dikerjakan', 'normal', 'Jurnal tentang Neural Networks')
        ]
        
        cursor.executemany('''
            INSERT INTO tasks (task_name, course_name, deadline, status, priority, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', sample_data)
        conn.commit()
        print("Sample data inserted!")
    
    conn.close()
    print("Database initialized successfully!")

@eel.expose
def get_tasks():
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks ORDER BY deadline ASC')
        
        tasks = []
        for row in cursor.fetchall():
            tasks.append({
                'id': row[0],
                'task_name': row[1],
                'course_name': row[2],
                'deadline': row[3],
                'status': row[4],
                'priority': row[5],
                'notes': row[6] if row[6] else '',
                'created_at': row[7],
                'updated_at': row[8]
            })
        
        conn.close()
        return {'success': True, 'tasks': tasks}
    except Exception as e:
        print(f"Error getting tasks: {e}")
        return {'success': False, 'message': str(e)}

@eel.expose
def get_task(task_id):
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE id=?', (task_id,))
        
        row = cursor.fetchone()
        if row:
            task = {
                'id': row[0],
                'task_name': row[1],
                'course_name': row[2],
                'deadline': row[3],
                'status': row[4],
                'priority': row[5],
                'notes': row[6] if row[6] else '',
                'created_at': row[7],
                'updated_at': row[8]
            }
            conn.close()
            return {'success': True, 'task': task}
        else:
            conn.close()
            return {'success': False, 'message': 'Task not found'}
    except Exception as e:
        print(f"Error getting task: {e}")
        return {'success': False, 'message': str(e)}

@eel.expose
def create_task(task_data):
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tasks (task_name, course_name, deadline, status, priority, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            task_data['task_name'],
            task_data['course_name'],
            task_data['deadline'],
            task_data['status'],
            task_data['priority'],
            task_data.get('notes', '')
        ))
        
        conn.commit()
        task_id = cursor.lastrowid
        conn.close()
        
        print(f"Task created with ID: {task_id}")
        return {'success': True, 'id': task_id}
    except Exception as e:
        print(f"Error creating task: {e}")
        return {'success': False, 'message': str(e)}

@eel.expose
def update_task(task_data):
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE tasks 
            SET task_name=?, course_name=?, deadline=?, status=?, priority=?, notes=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
        ''', (
            task_data['task_name'],
            task_data['course_name'],
            task_data['deadline'],
            task_data['status'],
            task_data['priority'],
            task_data.get('notes', ''),
            task_data['id']
        ))
        
        conn.commit()
        conn.close()
        
        print(f"Task {task_data['id']} updated")
        return {'success': True}
    except Exception as e:
        print(f"Error updating task: {e}")
        return {'success': False, 'message': str(e)}

@eel.expose
def delete_task(task_id):
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM tasks WHERE id=?', (task_id,))
        
        conn.commit()
        conn.close()
        
        print(f"Task {task_id} deleted")
        return {'success': True}
    except Exception as e:
        print(f"Error deleting task: {e}")
        return {'success': False, 'message': str(e)}

@eel.expose
def get_tasks_by_status(status):
    try:
        conn = sqlite3.connect('task_manager.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM tasks WHERE status=? ORDER BY deadline ASC', (status,))
        
        tasks = []
        for row in cursor.fetchall():
            tasks.append({
                'id': row[0],
                'task_name': row[1],
                'course_name': row[2],
                'deadline': row[3],
                'status': row[4],
                'priority': row[5],
                'notes': row[6] if row[6] else ''
            })
        
        conn.close()
        return {'success': True, 'tasks': tasks}
    except Exception as e:
        print(f"Error getting tasks by status: {e}")
        return {'success': False, 'message': str(e)}

if __name__ == '__main__':
    print("===========================================")
    print("  Task Manager Mahasiswa - Desktop App")
    print("===========================================")
    print("Initializing database...")
    init_db()
    print("Starting application...")
    
    try:
        eel.start('index.html', size=(1280, 800), port=8080)
    except Exception as e:
        print(f"Error starting application: {e}")
        input("Press Enter to exit...")
