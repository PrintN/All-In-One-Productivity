use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Serialize, Deserialize, Debug)]
pub struct FileInfo {
    name: String,
    kind: String,
    path: String,
}

#[derive(Serialize, Deserialize)]
pub struct Post {
    title: String,
    created: String,
    link: String,
    description: String,
    content: String,
    author: String,
}

pub fn read_directory(dir_path: &str) -> Result<String, String> {
    let new_path = Path::new(dir_path);
    println!("Attempting to read directory: {:?}", new_path);

    if !new_path.exists() {
        return Err(format!("Path does not exist: {:?}", new_path));
    }

    let paths = match fs::read_dir(new_path) {
        Ok(paths) => paths,
        Err(e) => {
            println!("Failed to read directory: {:?}", e);
            return Ok("[]".to_string()); // Return an empty list on error
        }
    };

    let mut files: Vec<FileInfo> = Vec::new();

    for path in paths {
        let path_unwrap = match path {
            Ok(path) => path,
            Err(e) => {
                println!("Failed to unwrap path: {:?}", e);
                continue; // Skip this path and proceed with the next one
            }
        };

        let meta = match path_unwrap.metadata() {
            Ok(meta) => meta,
            Err(e) => {
                println!("Failed to read metadata: {:?}", e);
                continue; // Skip this path and proceed with the next one
            }
        };

        let kind = if meta.is_dir() {
            String::from("directory")
        } else {
            String::from("file")
        };

        let filename = match path_unwrap.file_name().into_string() {
            Ok(os_string) => os_string,
            Err(os_string) => os_string.to_string_lossy().to_string(),
        };

        let file_path = new_path.join(&filename);

        let new_file_info = FileInfo {
            name: filename,
            kind,
            path: file_path.to_string_lossy().to_string(),
        };

        files.push(new_file_info);
    }

    let files_str = serde_json::to_string(&files).map_err(|e| e.to_string())?;

    Ok(files_str)
}

pub fn read_file(path: &str) -> String {
    let contents = fs::read_to_string(path).unwrap_or_else(|e| {
        println!("Failed to read file {}: {:?}", path, e);
        String::new() // Return an empty string on error
    });
    contents
}

pub fn write_file(path: &str, content: &str) -> String {
    let file_path = Path::new(path);
    let result = match fs::write(file_path, content) {
        Ok(()) => String::from("OK"),
        Err(e) => {
            println!("Failed to write file {}: {:?}", path, e);
            String::from("ERROR")
        }
    };

    result
}