import sys
import json

def main():
    """Reads input from stdin and returns a minimal JSON structure to stdout."""
    
    if len(sys.argv) < 2:
        sys.exit(1)

    command = sys.argv[1]
    
    # Consume the large JSON payload sent by server.cjs, even if we don't use it yet
    try:
        _ = json.loads(sys.stdin.read())
    except:
        pass
        
    # Return a mock SolarAnalysisResult for the frontend to receive successfully
    if command == 'run_idea':
        idea_id = sys.argv[2]
        print(json.dumps({"status": "stub_ran", "idea_id": idea_id, "confidence": 0.5}))
    
    elif command == 'run_all':
        # This structure is enough to satisfy the React Context expectation
        print(json.dumps({
            "id": "mock_id_full_run", 
            "confidence": 0.75, 
            "has_solar": True, 
            "qc_status": "VERIFIABLE",
            "area_sqm": 50.0,
            "panel_count": 20,
            "reason_codes": [],
            "artifacts": {"mask_data_url": ''}
        }))
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()