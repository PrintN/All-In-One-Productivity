#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod helper;

use std::fs;
use std::io;
use std::path::{Path};
use ignore::WalkBuilder;
use tauri::command;
use tauri::api::path::local_data_dir;
use serde::Deserialize;

#[derive(Deserialize)]
struct DeleteFileArgs {
    path: String,
}

#[command]
fn delete_file(args: DeleteFileArgs) -> Result<(), String> {
    let path = Path::new(&args.path);
    if path.is_file() {
        fs::remove_file(path).map_err(|e| e.to_string())
    } else if path.is_dir() {
        fs::remove_dir_all(path).map_err(|e| e.to_string())
    } else {
        Err("Path does not exist".to_string())
    }
}

#[command]
fn move_extension(directory_path: String) -> Result<String, String> {
    let app_data_path = local_data_dir().expect("Failed to get app local data directory");
    let target_folder = app_data_path.join("AIOP/Extensions");

    // Ensure the target folder exists
    if !target_folder.exists() {
        if let Err(e) = fs::create_dir_all(&target_folder) {
            return Err(format!("Failed to create target folder: {}", e));
        }
    }

    // Construct source and target paths
    let source_path = Path::new(&directory_path);
    let source_name = source_path.file_name().unwrap().to_string_lossy();
    let target_path = target_folder.join(&*source_name);

    // Copy directory to target folder
    if let Err(e) = copy_directory(&source_path, &target_path) {
        return Err(format!("Failed to copy directory: {}", e));
    }

    Ok(format!("Successfully copied extension to {:?}", target_path))
}

fn copy_directory(source: &Path, target: &Path) -> Result<(), io::Error> {
    // Ensure the target directory exists
    fs::create_dir_all(target)?;

    // Traverse the source directory recursively
    for entry in WalkBuilder::new(source).build() {
        match entry {
            Ok(entry) => {
                let source_path = entry.path();
                let relative_path = match source_path.strip_prefix(source) {
                    Ok(rp) => rp,
                    Err(e) => return Err(io::Error::new(io::ErrorKind::Other, e)),
                };
                let target_path = target.join(relative_path);

                if entry.path().is_file() {
                    // If it's a file, copy it to the target directory
                    fs::copy(&source_path, &target_path)?;
                } else if entry.path().is_dir() {
                    // If it's a directory, create it in the target location
                    fs::create_dir_all(&target_path)?;
                }
            }
            Err(e) => {
                eprintln!("Error traversing directory: {}", e);
            }
        }
    }

    Ok(())
}

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[command]
fn open_folder(folder_path: &str) -> Result<String, String> {
    helper::read_directory(folder_path)
}

#[command]
fn get_file_content(file_path: &str) -> String {
    let content = helper::read_file(file_path);
    content
}

#[command]
fn write_file(file_path: &str, content: &str) -> String {
    helper::write_file(file_path, content);
    String::from("OK")
}

#[command]
fn read_file(path: String) -> Result<String, String> {
    use std::fs;

    // Read the file contents
    match fs::read_to_string(&path) {
        Ok(contents) => Ok(contents),
        Err(err) => Err(err.to_string()),
    }
}

#[command]
fn remove_extension_folder(directory_name: String) -> Result<String, String> {
    let app_data_path = local_data_dir().expect("Failed to get app local data directory");
    let target_folder = app_data_path.join(format!("AIOP/Extensions/{}", directory_name));

    // Check if the folder exists
    if !target_folder.exists() {
        return Err(format!("Extension folder '{}' does not exist.", directory_name));
    }

    // Attempt to remove the directory
    match fs::remove_dir_all(&target_folder) {
        Ok(_) => Ok(format!("Successfully removed extension folder '{}'", directory_name)),
        Err(e) => Err(format!("Failed to remove extension folder '{}': {}", directory_name, e)),
    }
}

fn main() {
    // Get the AppData\Local directory for the application
    let app_data_path = local_data_dir().expect("Failed to get app local data directory");
    let aiop_folder = app_data_path.join("AIOP");
    let target_folder = aiop_folder.join("Extensions");

    // Create the "AIOP" and "Extensions" directories if they don't exist
    if !aiop_folder.exists() {
        match fs::create_dir(&aiop_folder) {
            Ok(_) => println!("Created AIOP folder: {:?}", aiop_folder),
            Err(e) => eprintln!("Failed to create AIOP folder: {}", e),
        }
    }

    if !target_folder.exists() {
        match fs::create_dir(&target_folder) {
            Ok(_) => println!("Created Extensions folder: {:?}", target_folder),
            Err(e) => eprintln!("Failed to create Extensions folder: {}", e),
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            open_folder,
            get_file_content,
            write_file,
            move_extension,
            read_file,
            remove_extension_folder,
            delete_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
