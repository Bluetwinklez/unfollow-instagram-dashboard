import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

class LogMonitorTest(unittest.TestCase):
    def test_missing_partial_and_sensitive_fields(self):
        spec = importlib.util.spec_from_file_location('monitor', Path('scripts/live-log-monitor.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / 'log.jsonl'
            self.assertFalse(module.snapshot(file)['available'])
            file.write_text(json.dumps({'event':'request.end','status':429,'cookie':'do-not-print','username':'private-name'})+'\n'+json.dumps({'event':'private-name','status':200})+'\n{partial', encoding='utf-8')
            report = module.snapshot(file)
            self.assertEqual(report['events'], {'request.end':1})
            self.assertEqual(report['httpStatuses'], {'429':1})
            text=json.dumps(report)
            for secret in ['private-name','do-not-print','cookie']:
                self.assertNotIn(secret,text)

if __name__ == '__main__':
    unittest.main()
